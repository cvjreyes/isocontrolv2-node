const {
  findAllUsersService,
  getUserService,
  checkIfUserExistsService,
  getOwnersService,
  changePasswordService,
} = require("./user.services");
const validator = require("validator");
const { validatePassword } = require("./user.validations");
const { send } = require("../../helpers/send");
const { createToken } = require("../../helpers/token");

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

exports.getOwners = async (req, res) => {
  try {
    const owners = await getOwnersService();
    send(res, true, owners);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.changePassword = async (req, res) => {
  const { user_id } = req;
  const { old_password, new_password, confirm_new_password } = req.body;
  try {
    if (!old_password || !new_password || !confirm_new_password)
      return send(res, false, "All fields must be filled");
    if (new_password.length < 6 || confirm_new_password.length < 6)
      return send(res, false, "New password must be 6 characters long min");
    if (new_password !== confirm_new_password)
      return send(res, false, "Passwords should match");
    if (old_password === new_password)
      return send(res, false, "New password can't be equal to current one");
    const { password } = await getUserService(user_id);
    const validatedPassword = validatePassword(old_password, password);
    if (!validatedPassword) return send(res, false, "Invalid credentials");
    const updated = await changePasswordService(new_password, user_id);
    return send(res, true, "Password updated successfully!");
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};
