const md5 = require("md5");
const pool = require("../../../config/db");
const { checkIfEmailExists } = require("./user.validations");
const { getName } = require("./users.helpers");

exports.findAllUsersService = async () => {
  const [users] = await pool.query("SELECT * FROM users");
  return users;
};

exports.getUserService = async (userId) => {
  const [user] = await pool.query(`SELECT * FROM users WHERE id = ${userId}`);
  return user[0];
};

exports.getUserRolesService = async (user_id) => {
  const [roles] = await pool.query(
    "SELECT r.id, r.name FROM roles as r JOIN model_has_roles as mhr ON mhr.role_id = r.id WHERE mhr.user_id = ?",
    [user_id]
  );
  return roles;
};

exports.checkIfUserExistsService = async (email) => {
  const [user] = await pool.query(
    `SELECT * FROM users WHERE email = '${email}'`
  );
  return user[0];
};

exports.getOwnersService = async () => {
  const [owners] = await pool.query(
    "SELECT `users`.`name` as name FROM `users` LEFT JOIN model_has_roles ON `users`.id = model_has_roles.user_id  LEFT JOIN roles ON `model_has_roles`.role_id = roles.id WHERE role_id = 1"
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

exports.createAdminService = async (email, pw) => {
  const exists = await checkIfEmailExists(email);
  if (exists) return false;
  const encryptedPw = md5(pw);
  const fullName = getName(email);
  await pool.query(
    "INSERT INTO users (name, email, password, admin) VALUES (?, ?, ?, 1)",
    [fullName, email, encryptedPw]
  );
  return true;
};

exports.createUserService = async (data) => {
  data.forEach(async ({ email, roles }) => {
    // create user
    const [res] = await pool.query(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [getName(email), email]
    );
    // add user and roles
    for (let i = 0; i < roles.length; i++) {
      await pool.query(
        "INSERT INTO model_has_roles (role_id, user_id) VALUES (?, ?)",
        [roles[i].id, res.insertId]
      );
    }
  });
  return true;
};
