const { send } = require("../../helpers/send");
const { getProgressService } = require("../../services/services");

exports.getProgress = async (req, res) => {
  try {
    const progress = await getProgressService("feed_pipes");
    return send(res, true, progress);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};
