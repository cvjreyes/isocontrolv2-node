const pool = require("../../../config/db");
const {
  fillType,
  getAreaId,
  getLineRefno,
  getOwnerId,
  fillProgress,
} = require("../../helpers/pipes");
const {
  calculateNextStep,
  formatStatus,
  calculatePreviousStep,
} = require("../../helpers/progressNumbers");
const { withTransaction } = require("../../helpers/withTransaction");

exports.getPipesService = async () => {
  const [resRows] = await pool.query("SELECT * FROM ifd_pipes_view");
  const rows = fillType(resRows);
  const rowsEnd = rows.map((row) => ({
    ...row,
    status: formatStatus(row.status),
  }));
  return rowsEnd;
};

exports.getMyPipesService = async (id) => {
  const [resRows] = await pool.query(
    "SELECT SQL_NO_CACHE * FROM ifd_pipes_view WHERE owner_id = ? AND status <> ?",
    [id, "ESTIMATED"]
  );
  /// RE-CHECK THIS
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
    `SELECT * FROM ifd_pipes_view WHERE status LIKE '${status}%'`
  );
  const rows = fillType(resRows);
  const rowsEnd = fillProgress(rows);
  return rowsEnd;
};

exports.updateIFDPipesService = async (data) => {
  return await data.forEach(async (pipe) => {
    const area_id = await getAreaId(pipe.area);
    const line_refno = await getLineRefno(pipe.line_reference);
    const owner_id = pipe.owner ? await getOwnerId(pipe.owner) : null;
    const { ok } = await withTransaction(
      async () =>
        await pool.query(
          "UPDATE ifd_pipes SET line_refno = ?, area_id = ?, diameter = ?, train = ?, status = ?, feed_id = ?, owner_id = ? WHERE id = ?",
          [
            line_refno,
            area_id,
            pipe.diameter,
            pipe.train,
            pipe.status,
            pipe.id,
            owner_id,
            pipe.id,
          ]
        )
    );
    if (ok) return true;
    throw new Error("Something went wrong updating feed pipes");
  });
};

exports.deletePipe = async (id) => {
  const [pipes] = await pool.query("DELETE FROM ifd_pipes WHERE id = ?", id);
  return pipes;
};

exports.addIFDPipesService = async (pipe) => {
  const area_id = await getAreaId(pipe.area);
  const line_refno = await getLineRefno(pipe.line_reference);
  // añadir pipe en feed_pipes y coger feed_id
  const { insertId } = await addFeedPipesFromIFDService(
    {
      ...pipe,
      status: "MODELLED(100%)",
    },
    area_id,
    line_refno
  );
  const owner_id = await getOwnerId(pipe.owner);
  const res = await pool.query(
    "INSERT INTO ifd_pipes (line_refno, feed_id, area_id, diameter, train, status, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      line_refno,
      insertId,
      area_id,
      pipe.diameter,
      pipe.train,
      pipe.status,
      owner_id,
    ]
  );
  return res;
};

const addFeedPipesFromIFDService = async (pipe, area, line_refno) => {
  const [res] = await pool.query(
    "INSERT INTO feed_pipes (line_refno, area_id, diameter, train, status) VALUES (?, ?, ?, ?, ?)",
    [line_refno, area, pipe.diameter, pipe.train, pipe.status]
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
    if (ok) return true;
    throw new Error("Something went wrong claiming feed pipes");
  });
};

exports.previousStepService = async (data) => {
  return await data.forEach(async (pipe) => {
    const preciousStep = calculatePreviousStep(pipe.type, pipe.status)
      .replace("-", "")
      .toUpperCase();
    const { ok } = await withTransaction(
      async () =>
        await pool.query(
          "UPDATE ifd_pipes SET status = ?, owner_id = NULL WHERE id = ?",
          [preciousStep, pipe.id]
        )
    );
    if (ok) return true;
    throw new Error("Something went wrong claiming feed pipes");
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

exports.claimIFDPipesService = async (data, user_id) => {
  return await data.forEach(async (pipe) => {
    const { ok } = await withTransaction(
      async () =>
        await pool.query("UPDATE ifd_pipes SET owner_id = ? WHERE id = ?", [
          user_id,
          pipe.id,
        ])
    );
    if (ok) return true;
    throw new Error("Something went wrong claiming feed pipes");
  });
};
