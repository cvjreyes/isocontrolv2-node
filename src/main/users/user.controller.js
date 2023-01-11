const {
  findAllUsersService,
  getUserService,
  checkIfUserExistsService,
  getRoleIdsService,
  getUserRolesService,
  getOwnersService,
} = require("./user.services");
const validator = require("validator");
const { validatePassword } = require("./user.validations");
const { send } = require("../../helpers/send");
const { createToken } = require("../../helpers/token");
const { buildQueryService } = require("./users.microservices");

exports.findAll = async (req, res) => {
  try {
    const users = await findAllUsersService();
    return send(res, true, users);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const { user_id } = req;
    const user = await getUserService(user_id);
    return send(res, true, user);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) return send(res, false, "Please, fill all fields");
    const validatedEmail = validator.isEmail(email);
    if (!validatedEmail) return send(res, false, "Invalid credentials");
    const user = await checkIfUserExistsService(email);
    if (!user) return send(res, false, "Invalid credentials");
    const validatedPassword = validatePassword(password, user.password);
    if (!validatedPassword) return send(res, false, "Invalid credentials");
    const token = createToken(user.id);
    delete user.password;
    return send(res, true, { ...user, token });
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.getUserRoles = async (req, res) => {
  const { user_id } = req;
  try {
    const roles = await getRoleIdsService(user_id);
    const query = buildQueryService(roles);
    const userRoles = await getUserRolesService(query);
    send(res, true, { roles: userRoles });
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.getOwners = async (req, res) => {
  try {
    const owners = await getOwnersService();
    send(res, true, owners);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};
