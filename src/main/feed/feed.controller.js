const { fillType } = require("../../helpers/pipes");
const { send } = require("../../helpers/send");
const {
  getFeedPipesService,
  updateFeedPipesService,
  getProgressService,
  deletePipe,
  addPipesService,
  getFeedForecastService,
  addForecastService,
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

exports.getFeedForecast = async (req, res) => {
  //Get del forecast del feed
  try {
    const feedForecast = await getFeedForecastService();
    return send(res, true, feedForecast);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.submitFeedPipes = async (req, res) => {
  const { data } = req.body;
  try {
    await updateFeedPipesService(data);
    send(res, true);
    // this.getFeedPipes(req, res);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.submitForecast = async (req, res) => {
  const { day, estimated, forecast } = req.body;
  console.log("Hola ", estimated, forecast);
  try {
    await addForecastService(day, estimated, forecast);
    send(res, true);
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

exports.addPipes = async (req, res) => {
  const { data } = req.body;
  try {
    addPipesService(data);
    send(res, true);
  } catch (er) {
    console.error(err);
    return send(res, false, err);
  }
};
