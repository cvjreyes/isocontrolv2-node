const pool = require("../../../config/db");

exports.getRolesService = async () => {
  const [roles] = await pool.query("SELECT * FROM roles");
  return roles;
};
