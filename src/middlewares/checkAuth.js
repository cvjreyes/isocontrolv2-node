const jwt = require("jsonwebtoken");
const { send } = require("../helpers/send");
require("dotenv").config();

exports.checkAuth = (req, res, next) => {
  const token = req.headers?.authorization;
  console.log("token: ", token);
  if (!token) return send(res, false, "Unauthorized");
  jwt.verify(token, process.env.NODE_TOKEN_SECRET, (err, { id: user_id }) => {
    if (err) return send(res, false, "Invalid token");
    console.log("user_id: ", user_id);
    req.user_id = user_id;
    next();
  });
};
