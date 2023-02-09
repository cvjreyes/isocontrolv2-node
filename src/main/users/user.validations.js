const jwt = require("jsonwebtoken");
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

exports.validateToken = async (token) => {
  const [result] = await pool.query(
    "SELECT * FROM users WHERE token = ?",
    token
  );
  if (!result[0]) return false;
  let verifyToken = token.split("!").join(".");
  const test = jwt.verify(verifyToken, process.env.NODE_TOKEN_SECRET, (err) => {
    if (err) return false;
    return true;
  });
  return test;
};
