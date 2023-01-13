const pool = require("../../../config/db");
const { fillType } = require("../../helpers/pipes");

exports.deletePipe = async (id) => {
  const [pipes] = await pool.query("DELETE FROM ifd_pipes WHERE id = ?", id);
  return pipes;
};

exports.getPipesService = async () => {
  const [resRows] = await pool.query("SELECT * FROM ifd_pipes_view");
  const rows = fillType(resRows);
  return rows;
};
