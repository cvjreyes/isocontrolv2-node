const pool = require("../../../config/db");
const { withTransaction } = require("../../helpers/withTransaction");
const { getAreaId, fillType, fillProgress } = require("../../helpers/pipes");
const { formatStatus, calculateNextStep } = require("./progressNumbers");

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
  const [resRows] = await pool.query(
    `SELECT * FROM ifc_pipes_view WHERE status = '${status}' AND trashed = 0`
  );
  const rows = fillType(resRows);
  const rowsEnd = fillProgress(rows);
  return rowsEnd;
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

exports.addToIFC = async (pipe) => {
  const area_id = await getAreaId(pipe.area);
  await pool.query(
    "INSERT INTO ifc_pipes (line_refno, feed_id, area_id, train, status) VALUES (?, ?, ?, ?, ?)",
    [pipe.line_refno, pipe.feed_id, area_id, pipe.train, "DESIGN"]
  );
};

exports.removeFromIFC = async (pipe) => {
  const [ifc_pipe] = await pool.query(
    "SELECT * FROM ifc_pipes WHERE feed_id = ?",
    pipe.feed_id
  );
  const [removed] = await pool.query(
    "DELETE FROM ifc_pipes WHERE id = ?",
    ifc_pipe[0].id
  );
  console.log(removed);
};
