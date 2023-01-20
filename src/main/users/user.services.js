const md5 = require("md5");
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

exports.getRoleIdsService = async (id) => {
  const [roles] = await pool.query(
    "SELECT role_id FROM model_has_roles WHERE model_id = ?",
    [id]
  );
  return roles;
};

exports.getUserRolesService = async (q) => {
  const [userRoles] = await pool.query(q);
  return userRoles.map((x) => x.name);
};

exports.getOwnersService = async () => {
  const [owners] = await pool.query(
    "SELECT `users`.`name` as name FROM `users` LEFT JOIN model_has_roles ON `users`.id = model_has_roles.model_id  LEFT JOIN roles ON `model_has_roles`.role_id = roles.id WHERE role_id = 1"
  );
  return owners;
};

exports.changePasswordService = async (pw, user_id) => {
  const [updated] = await pool.query(
    "UPDATE users SET password = ? WHERE id = ?",
    [md5(pw), user_id]
  );
  return updated;
};
