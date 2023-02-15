const { send } = require("../../helpers/send");
const { getTotalRows } = require("./notifications.helpers");
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
    const notifications = await getSomeService(count);
    const total = !Number(count) && (await getTotalRows("notifications"));
    send(res, true, { notifications, total });
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};
