const pool = require("../../../config/db");

exports.getNavisSelectService = async () => {
  const [navis] = await pool.query("SELECT * FROM navis");
  return navis;
};
