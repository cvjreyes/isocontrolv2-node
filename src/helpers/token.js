const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.createToken = (id) => {
  return jwt.sign({ id }, process.env.NODE_TOKEN_SECRET, { expiresIn: "7d" });
};
