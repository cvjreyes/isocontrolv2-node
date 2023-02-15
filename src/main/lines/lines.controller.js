const { send } = require("../../helpers/send");
const { getLineRefsService } = require("./lines.service");

exports.getLineRefs = async (req, res) => {
  try {
    const [lineRefs] = await getLineRefsService();
    return send(res, true, lineRefs);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};
