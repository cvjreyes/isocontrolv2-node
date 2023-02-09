const md5 = require("md5");
const pool = require("../../../config/db");
const { createToken } = require("../../helpers/token");
const { insertTokenIntoDB } = require("./user.microservices");
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

exports.updateUserService = async (data) => {
  for (let i = 0; i < data.length; i++) {
    const { roles } = data[i];
    // find ids
    const ids = [];
    for (let j = 0; j < roles.length; j++) {
      const [id] = await pool.query(
        "SELECT id FROM roles WHERE name = ?",
        roles[j].label
      );
      ids.push(id[0].id);
    }
    // delete ids
    await pool.query(
      "DELETE FROM model_has_roles WHERE user_id = ?",
      data[i].id
    );
    // add ids
    for (let j = 0; j < ids.length; j++) {
      await pool.query(
        "INSERT INTO model_has_roles (role_id, user_id) VALUES (?, ?)",
        [ids[j], data[i].id]
      );
    }
  }
  return true;
};

exports.generateLinkService = async (user, page, expiresIn) => {
  // generate token
  const token = createToken(user.id, expiresIn).split(".").join("!");
  // save token into db
  await insertTokenIntoDB(user.email, token);
  // create link with user id + token
  const link = `${process.env.NODE_CLIENT_URL}/${page}/${user.id}/${token}`;
  return link;
};

exports.savePasswordService = async (user_id, pw) => {
  await pool.query("UPDATE users SET password = ? WHERE id = ?", [
    md5(pw),
    user_id,
  ]);
  return true;
};
