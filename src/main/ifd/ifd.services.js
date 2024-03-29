const pool = require("../../../config/db");
const {
  fillType,
  getAreaId,
  getOwnerId,
  fillProgress,
} = require("../../helpers/pipes");
const {
  calculateNextStep,
  formatStatus,
  calculatePreviousStep,
} = require("./progressNumbers");
const { withTransaction } = require("../../helpers/withTransaction");
const { addToIFC, removeFromIFC } = require("../ifc/ifc.services");
const {
  updatePipeInFeed,
  addFeedPipesFromIFDService,
} = require("./ifd.microservices");

exports.getPipesService = async (trashed) => {
  const [resRows] = await pool.query(
    "SELECT * FROM ifd_pipes_view WHERE trashed = ?",
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
    "SELECT * FROM ifd_pipes_view WHERE owner_id = ? AND status <> ? AND trashed = 0",
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
  const [resRows] = await pool.query(
    `SELECT * FROM ifd_pipes_view WHERE status LIKE '${status}%' AND trashed = 0`
  );
  const rows = fillType(resRows);
  const rowsEnd = fillProgress(rows);
  return rowsEnd;
};

exports.getProgressService = async () => {
  const [pipes] = await pool.query(
    "SELECT ifd_progress.*, ifd_forecast.estimated, ifd_forecast.forecast FROM ifd_progress JOIN ifd_forecast ON ifd_progress.id = ifd_forecast.`week` ORDER BY id ASC"
  );
  return pipes;
};

exports.getForecastService = async () => {
  const [pipes] = await pool.query(
    "SELECT * FROM ifd_forecast ORDER BY week DESC"
  );
  return pipes;
};

exports.claimPipesService = async (data, user_id) => {
  return await data.forEach(async (pipe) => {
    const { ok } = await withTransaction(
      async () =>
        await pool.query("UPDATE ifd_pipes SET owner_id = ? WHERE id = ?", [
          user_id,
          pipe.id,
        ])
    );
    if (ok) return true;
    throw new Error("Something went wrong claiming ifd pipes");
  });
};

exports.updatePipesService = async (data) => {
  return await data.forEach(async (pipe) => {
    const area_id = await getAreaId(pipe.area);
    const owner_id = pipe.owner ? await getOwnerId(pipe.owner) : null;
    const { ok } = await withTransaction(
      async () =>
        await pool.query(
          "UPDATE ifd_pipes SET line_refno = ?, area_id = ?, train = ?, status = ?, owner_id = ? WHERE id = ?",
          [
            pipe.line_refno,
            area_id,
            pipe.train,
            pipe.status.toUpperCase().replace(" ", "_"),
            owner_id,
            pipe.id,
          ]
        ),
      await updatePipeInFeed(pipe, area_id)
    );

    if (ok) return true;
    throw new Error("Something went wrong updating ifd pipes");
  });
};

exports.addPipesService = async (pipe) => {
  const area_id = await getAreaId(pipe.area);
  // añadir pipe en feed_pipes y coger feed_id
  const { insertId } = await addFeedPipesFromIFDService({
    ...pipe,
    status: "MODELLED(100%)",
    area_id,
  });
  const owner_id = pipe.owner ? await getOwnerId(pipe.owner) : null;
  const res = await pool.query(
    "INSERT INTO ifd_pipes (line_refno, feed_id, area_id, train, status, owner_id) VALUES (?, ?, ?, ?, ?, ?)",
    [pipe.line_refno, insertId, area_id, pipe.train, pipe.status, owner_id]
  );
  return res;
};

exports.nextStepService = async (data) => {
  return await data.forEach(async (pipe) => {
    const nextStep = calculateNextStep(pipe.type, pipe.status)
      .replace("-", "")
      .toUpperCase();
    const { ok } = await withTransaction(
      async () =>
        await pool.query(
          "UPDATE ifd_pipes SET status = ?, owner_id = NULL WHERE id = ?",
          [nextStep, pipe.id]
        )
    );
    if (nextStep === "SDESIGN") await addToIFC(pipe);
    if (ok) return true;
    throw new Error("Something went wrong claiming ifd pipes");
  });
};

exports.previousStepService = async (data) => {
  return await data.forEach(async (pipe) => {
    const previousStep = calculatePreviousStep(pipe.type, pipe.status)
      .replace("-", "")
      .toUpperCase();
    const { ok } = await withTransaction(
      async () =>
        await pool.query(
          "UPDATE ifd_pipes SET status = ?, owner_id = NULL WHERE id = ?",
          [previousStep, pipe.id]
        )
    );
    if (pipe.status === "S-Design") await removeFromIFC(pipe);
    if (ok) return true;
    throw new Error("Something went wrong claiming ifd pipes");
  });
};

exports.changeActionsService = async (data) => {
  return await data.forEach(async (pipe) => {
    const { ok } = await withTransaction(
      async () =>
        await pool.query(
          "UPDATE ifd_pipes SET valve = ?, instrument = ?, NA = ? WHERE id = ?",
          [pipe.valve, pipe.instrument, pipe.NA, pipe.id]
        )
    );
    if (ok) return true;
    throw new Error("Something went wrong updating feed pipes");
  });
};

exports.restorePipesService = async (data) => {
  return await data.forEach(async (pipe) => {
    const { ok } = await withTransaction(
      async () =>
        await pool.query("UPDATE ifd_pipes SET trashed = 0 WHERE id = ?", [
          pipe.id,
        ])
    );
    if (ok) return true;
    throw new Error("Something went wrong restoring ifd pipes");
  });
};

exports.addForecastService = async (data) => {
  try {
    data.forEach(async (item) => {
      await pool.query("CALL add_ifd_forecast (?, ?, ?)", [
        item.week,
        item.estimated,
        item.forecast,
      ]);
    });
    return true;
  } catch (err) {
    console.error(err);
    throw new Error("Something went wrong updating ifd pipes");
  }
};

exports.deletePipe = async (id) => {
  const [pipes] = await pool.query(
    "UPDATE ifd_pipes SET trashed = 1, owner_id = NULL WHERE id = ?",
    id
  );
  return pipes;
};
