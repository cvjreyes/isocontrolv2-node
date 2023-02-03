const md5 = require("md5");
const pool = require("../../../config/db");

exports.validatePassword = (received, existing) => {
  const decrypted = md5(received);
  return decrypted === existing;
};

exports.checkIfEmailExists = async (email) => {
  const [user] = await pool.query("SELECT * FROM users WHERE email = ?", email);
  return !!user[0];
};
