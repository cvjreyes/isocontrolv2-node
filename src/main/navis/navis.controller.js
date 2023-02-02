const { send } = require("../../helpers/send");
const { getNavisSelectService } = require("./navis.services");

exports.getNavisSelect = async (req, res) => {
  try {
    const navis = await getNavisSelectService();
    send(res, true, navis);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};