const pool = require("../../../config/db");
const { getAreaId, fillType } = require("../../helpers/pipes");
const { formatIFCStatus } = require("../../helpers/progressNumbers");

exports.getPipesService = async (trashed) => {
  const [resRows] = await pool.query(
    "SELECT * FROM ifc_pipes_view WHERE trashed = ?",
    trashed
  );
  const rows = fillType(resRows);
  const rowsEnd = rows.map((row) => ({
    ...row,
    status: formatIFCStatus(row.status),
  }));
  return rowsEnd;
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
