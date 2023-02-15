const { send } = require("../../helpers/send");
const {
  getLast10Service,
  getSomeService,
} = require("./notifications.services");

exports.getLast10 = async (req, res) => {
  try {
    const notifications = await getLast10Service();
    return send(res, true, notifications);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.getSome = async (req, res) => {
  const { count } = req.params;
  try {
    const notifications = getSomeService(count);
    send(res, true);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};
