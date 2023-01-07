const { send } = require("../../helpers/send");
const { fillType } = require("./feed.microservices");
const {
  getFeedPipesService,
  updateFeedPipesService,
  getProgressService,
  deletePipe,
} = require("./feed.services");

exports.getProgress = async (req, res) => {
  try {
    const progress = await getProgressService("feed_pipes");
    return send(res, true, progress);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.getFeedPipes = async (req, res) => {
  try {
    const resRows = await getFeedPipesService();
    const rows = fillType(resRows);
    return send(res, true, rows);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.submitFeedPipes = async (req, res) => {
  const { data } = req.body;
  try {
    const rows = fillType(data);
    await updateFeedPipesService(rows);
    send(res, true);
    // this.getFeedPipes(req, res);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.deletePipe = async (req, res) => {
  const { id } = req.params;
  try {
    const del = await deletePipe(id);
    // await updateFeedPipesService(rows);
    send(res, true, del);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};
