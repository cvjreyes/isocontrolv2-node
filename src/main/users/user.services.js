const pool = require("../../../config/db");

exports.findAll = async () => {
  const [users] = await pool.query("SELECT * FROM users");
  return users;
};

exports.getOneUser = async (email) => {
  const [user] = await pool.query(`SELECT * FROM users WHERE email = ${email}`);
  return user;
};
