const md5 = require("md5");
const pool = require("../../../config/db");

exports.validatePassword = (received, existing) => {
  const decrypted = md5(received);
  return decrypted === existing;
};

exports.checkIfEmailsExist = async (data) => {
  let allUsersNonexistent = true;
  for (let i = 0; i < data.length; i++) {
    const [user] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      data[i].email
    );
    if (user[0]) allUsersNonexistent = false;
  }
  return allUsersNonexistent;
};
