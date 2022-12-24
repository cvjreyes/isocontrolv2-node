const pool = require("../../../config/db");

exports.findAllUsersService = async () => {
  const [users] = await pool.query("SELECT * FROM users");
  return users;
};

exports.getUserService = async (userId) => {
  const [user] = await pool.query(`SELECT * FROM users WHERE id = ${userId}`);
  return user[0];
};

exports.checkIfUserExistsService = async (email) => {
  const [user] = await pool.query(
    `SELECT * FROM users WHERE email = '${email}'`
  );
  return user[0];
};
