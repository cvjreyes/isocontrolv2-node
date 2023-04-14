const pool = require("../../../config/db");
const { withTransaction } = require("../../helpers/withTransaction");
const { getAreaId, fillType } = require("../../helpers/pipes");
const {
  formatStatus,
  calculateNextStep,
  calculatePreviousStep,
  fillProgress,
} = require("./progressNumbers");
const { send } = require("../../helpers/send");

exports.getPipesService = async (trashed) => {
  const [resRows] = await pool.query(
    "SELECT * FROM ifc_pipes_view WHERE trashed = ?",
    trashed
  );
  const rows = fillType(resRows);
  const rowsEnd = rows.map((row) => ({
    ...row,
    status: formatStatus(row.status),
  }));
  return rowsEnd;
};

exports.getMyPipesService = async (id) => {
  const [resRows] = await pool.query(
    "SELECT * FROM ifc_pipes_view WHERE owner_id = ? AND status <> ? AND trashed = 0",
    [id, "ESTIMATED"]
  );
  const rows = fillType(resRows);
  const rows2 = fillProgress(rows);
  const rowsEnd = rows2.map((row) => ({
    ...row,
    next_step: calculateNextStep(row.type, row.status),
    status: formatStatus(row.status),
  }));
  return rowsEnd;
};

exports.getPipesFromTrayService = async (status) => {
  const queryStatus = status.replace("-", " ");
  const [resRows] = await pool.query(
    `SELECT * FROM ifc_pipes_view WHERE status = '${queryStatus}' AND trashed = 0`
  );
  const rows = fillType(resRows);
  const rowsEnd = fillProgress(rows);
  return rowsEnd;
};

exports.getPipesWithActionService = async (action) => {
  const [resRows] = await pool.query(
    `SELECT * FROM ifc_pipes_view WHERE ${action} = 1 AND trashed = 0`
  );
  const rows = fillType(resRows);
  const rowsEnd = fillProgress(rows);
  return rowsEnd;
};

exports.getPipeInfoService = async (pipe_id) => {
  const [pipes] = await pool.query(
    "SELECT * FROM ifc_pipes_view WHERE id = ?",
    pipe_id
  );
  return pipes[0];
};

exports.getFilesService = async (pipe_id) => {
  const [files] = await pool.query(
    "SELECT * FROM files WHERE pipe_id = ?",
    pipe_id
  );
  return files;
};

exports.claimPipesService = async (data, user_id) => {
  return await data.forEach(async (pipe) => {
    const { ok } = await withTransaction(
      async () =>
        await pool.query("UPDATE ifc_pipes SET owner_id = ? WHERE id = ?", [
          user_id,
          pipe.id,
        ])
    );
    if (ok) return true;
    throw new Error("Something went wrong claiming ifd pipes");
  });
};

exports.nextStepService = async (data, res) => {
  let isError = false;
  for (let i = 0; i < data.length; i++) {
    const pipe = data[i];
    // check if pipe has master attached
    const [master] = await pool.query(
      "SELECT * FROM files WHERE pipe_id = ? AND title = 'master'",
      pipe.id
    );
    if (!master[0]) {
      isError = true;
      return send(res, false, "Pipe needs master file");
    }
    const nextStep = calculateNextStep(pipe.type, pipe.status)
      .replace("-", "")
      .toUpperCase();
    await withTransaction(
      async () =>
        await pool.query(
          "UPDATE ifc_pipes SET status = ?, owner_id = NULL, toValidate = 0 WHERE id = ?",
          [nextStep, pipe.id]
        )
    );
    // if (ok) return true;
    // throw new Error("Something went wrong claiming ifd pipes");
  }
  console.log({ isError });
  !isError && send(res, true);
};

exports.previousStepService = async (data) => {
  return await data.forEach(async (pipe) => {
    const previousStep = calculatePreviousStep(pipe.type, pipe.status)
      .replace("-", "")
      .toUpperCase();
    const { ok } = await withTransaction(
      async () =>
        await pool.query(
          "UPDATE ifc_pipes SET status = ?, owner_id = NULL WHERE id = ?",
          [previousStep, pipe.id]
        )
    );
    if (ok) return true;
    throw new Error("Something went wrong claiming ifd pipes");
  });
};

exports.addToIFC = async (pipe) => {
  const area_id = await getAreaId(pipe.area);
  const revision = pipe.revision + 1 || 0;
  await pool.query(
    "INSERT INTO ifc_pipes (line_refno, feed_id, area_id, train, status, revision) VALUES (?, ?, ?, ?, ?, ?)",
    [pipe.line_refno, pipe.feed_id, area_id, pipe.train, "DESIGN", revision]
  );
};

exports.removeFromIFC = async (pipe) => {
  const [ifc_pipe] = await pool.query(
    "SELECT * FROM ifc_pipes WHERE feed_id = ?",
    pipe.feed_id
  );
  await pool.query("DELETE FROM ifc_pipes WHERE id = ?", ifc_pipe[0].id);
};

exports.updatePipeService = async (key, val, id) => {
  await pool.query(`UPDATE ifc_pipes SET ${key} = ${val} WHERE id = ${id}`);
};

exports.addFileService = async (pipe_id, tag, name, filename) => {
  await pool.query(
    "INSERT INTO files (pipe_id, tag, title, filename) VALUES (?, ?, ?, ?)",
    [pipe_id, tag, name, filename]
  );
};

exports.updateProcessService = async (bool, id) => {
  await pool.query(
    "UPDATE ifc_pipes SET is_process_accepted = ?, process = 0, process_owner = NULL WHERE id = ?",
    [bool, id]
  );
};

exports.getFilenameService = async (pipe_id, title) => {
  const [res] = await pool.query(
    "SELECT * FROM files WHERE pipe_id = ? AND title = ?",
    [pipe_id, title]
  );
  return res[0];
};

exports.restorePipesService = async (data) => {
  return await data.forEach(async (pipe) => {
    const { ok } = await withTransaction(
      async () =>
        await pool.query("UPDATE ifc_pipes SET trashed = 0 WHERE id = ?", [
          pipe.id,
        ])
    );
    if (ok) return true;
    throw new Error("Something went wrong restoring ifd pipes");
  });
};

exports.returnToTrayService = async (pipe_id, returnTo) => {
  await pool.query(
    "UPDATE ifc_pipes SET status = ?, owner_id = NULL WHERE id = ?",
    [returnTo.toUpperCase(), pipe_id]
  );
};

exports.revisionService = async (id) => {
  await pool.query("UPDATE ifc_pipes SET isBlocked = 1 WHERE id = ?", id);
};

exports.claimProcessServices = async (user_id, pipe_id) => {
  await pool.query("UPDATE ifc_pipes SET process_owner = ? WHERE id = ?", [
    user_id,
    pipe_id,
  ]);
};

exports.unclaimProcessServices = async (pipe_id) => {
  await pool.query(
    "UPDATE ifc_pipes SET process_owner = NULL WHERE id = ?",
    pipe_id
  );
};
