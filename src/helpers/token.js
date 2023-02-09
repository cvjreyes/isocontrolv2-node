const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.createToken = (id, expiresIn) => {
  const token = jwt.sign({ id }, process.env.NODE_TOKEN_SECRET, {
    expiresIn: expiresIn || "7d",
  });
  // relpace dots bc url will redirect to another page
  // exclamation is not used by algorithm so when replaced back to dots there'll be no conflicts
  return token;
};
