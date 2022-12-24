const md5 = require("md5");

exports.validatePassword = (received, existing) => {
  const decrypted = md5(received);
  console.log(received, decrypted);
  return decrypted === existing;
};
