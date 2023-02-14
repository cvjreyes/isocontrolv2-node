const {
  findAllUsersService,
  getUserService,
  checkIfUserExistsService,
  getOwnersService,
  changePasswordService,
  createAdminService,
  createUserService,
  getUserRolesService,
  updateUserService,
  generateLinkService,
  savePasswordService,
  updateLastSeenService,
} = require("./user.services");
const validator = require("validator");
const {
  validatePassword,
  checkIfEmailsExist,
  validateToken,
} = require("./user.validations");
const { send } = require("../../helpers/send");
const { createToken } = require("../../helpers/token");
const { sendEmail } = require("../emails/emails");

exports.findAll = async (req, res) => {
  try {
    const users = await findAllUsersService();
    for (let i = 0; i < users.length; i++) {
      const tempRoles = await getUserRolesService(users[i].id);
      users[i].roles = tempRoles.map((x) => ({ label: x.name, value: x.name }));
    }
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
    const roles = await getUserRolesService(user_id);
    return send(res, true, { ...user, roles });
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
    const roles = await getUserRolesService(user.id);
    const token = createToken(user.id);
    delete user.password;
    return send(res, true, { ...user, token, roles });
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
    await changePasswordService(new_password, user_id);
    return send(res, true, "Password updated successfully!");
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.createAdmin = async (req, res) => {
  const { email, pw } = req.body;
  try {
    const ok = await createAdminService(email.trim(), pw.trim());
    if (ok) return send(res, true);
    return send(res, false, "Stop inventing");
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.create = async (req, res) => {
  const { data } = req.body;
  try {
    const validCredentials = data.every((x) => validator.isEmail(x.email));
    if (!validCredentials)
      return send(res, false, "All emails should be valid");
    const allUsersNonexistent = await checkIfEmailsExist(data);
    if (!allUsersNonexistent)
      return send(res, false, "Some user already exist");
    const ok = await createUserService(data);
    if (ok) return send(res, true);
    return send(res, false, "Stop inventing");
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.update = async (req, res) => {
  const { data } = req.body;
  try {
    await updateUserService(data);
    send(res, true, `User${data.length > 1 ? "s" : ""} updated successfully!`);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.updateLastSeen = async (req, res) => {
  const { user_id } = req;
  try {
    await updateLastSeenService(user_id);
    send(res, true);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.requestAccess = async (req, res) => {
  const { email } = req.body;
  try {
    // check email
    const user = await checkIfUserExistsService(email);
    if (!user)
      return send(res, false, "Ask your manager to create your user first");
    // generate token + link
    const link = await generateLinkService(user, "create_password", "1h");
    // send email
    const ok = await sendEmail(
      email,
      "IsoControl: Request access",
      "request",
      link
    );
    if (!ok) return send(res, false, "Something went wrong");
    return send(res, true, "Email sent successfully");
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.validateCredentials = async (req, res) => {
  const { user_id, token } = req.body;
  try {
    const user = await getUserService(user_id);
    if (!user) return send(res, false, "Link invalid");
    const validated = await validateToken(token);
    return send(res, validated);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.choosePassword = async (req, res) => {
  const { password, passwordConfirm, user_id } = req.body;
  try {
    if (password !== passwordConfirm)
      return send(res, false, "Passwords should match");
    await savePasswordService(user_id, password);
    return send(res, true, "Password saved successfully!");
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // check email
    const user = await checkIfUserExistsService(email);
    if (!user) return send(res, false, "This email doesn't exist");
    // generate token + link
    const link = await generateLinkService(user, "reset_password", "1h");
    // send email
    const ok = await sendEmail(
      email,
      "IsoControl: Reset password",
      "reset",
      link
    );
    if (!ok) return send(res, false, "Something went wrong");
    return send(res, true, "Email sent successfully");
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};
