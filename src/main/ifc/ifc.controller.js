const { send } = require("../../helpers/send");
const { getPipesService } = require("./ifc.services");

exports.getProgress = async (req, res) => {
  try {
    // const progress = await getProgressService("feed_pipes");
    return send(res, true, 0);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.getPipes = async (req, res) => {
  const { trashed } = req.params;
  try {
    const pipes = await getPipesService(trashed);
    send(res, true, pipes);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};
