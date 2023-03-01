const jwt = require("jsonwebtoken");
const { send } = require("../helpers/send");
require("dotenv").config();

exports.checkAuth = (req, res, next) => {
  const token = req.headers?.authorization;
  if (!token) return send(res, false, "Unauthorized");
  jwt.verify(token, process.env.NODE_TOKEN_SECRET, (err, data) => {
    if (err) return send(res, false, "Invalid token");
    req.user_id = data.id;
    next();
  });
};
