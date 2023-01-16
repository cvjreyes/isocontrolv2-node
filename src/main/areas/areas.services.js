const pool = require("../../../config/db");

exports.getAreasService = async () => {
  const [areas] = await pool.query("SELECT name FROM areas");
  return areas;
};
