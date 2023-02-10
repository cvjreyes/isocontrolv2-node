const { send } = require("../../helpers/send");
const { getRolesService } = require("./roles.services");

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await getRolesService();
    return send(res, true, roles);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};
