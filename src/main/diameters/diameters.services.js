const pool = require("../../../config/db");

exports.getDiametersService = async () => {
  if (process.env.NODE_NPSDN == "1") {
    let [diameters] = await pool.query("SELECT dn as diameter FROM diameters");
    return diameters;
  } else {
    let [diameters] = await pool.query("SELECT nps as diameter FROM diameters");
    return diameters;
  }
};
