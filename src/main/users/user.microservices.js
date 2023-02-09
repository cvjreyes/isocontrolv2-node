const pool = require("../../../config/db");

exports.insertTokenIntoDB = async (email, token) => {
  await pool.query("UPDATE users SET token = ? WHERE email = ?", [
    token,
    email,
  ]);
  return true;
};
