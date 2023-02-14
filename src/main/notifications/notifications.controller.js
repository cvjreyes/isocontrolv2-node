const { send } = require("../../helpers/send");
const { getLast10Service } = require("./notifications.services");

exports.getLast10 = async (req, res) => {
  try {
    const notifications = await getLast10Service();
    return send(res, true, notifications);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};
