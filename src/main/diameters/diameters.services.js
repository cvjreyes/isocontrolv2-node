const pool = require("../../../config/db");

exports.getDiametersService = async () => {
  if (process.env.NODE_MMDN == "1") {
    let [diameters] = await pool.query("SELECT dn as diameter FROM diameters");
    console.log("First diameter: ", diameters);
    return diameters;
  } else {
    let [diameters] = await pool.query("SELECT nps as diameter FROM diameters");
    console.log("Second diameter: ", diameters);
    return diameters;
  }
};
