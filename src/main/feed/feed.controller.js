const { fillType } = require("../../helpers/pipes");
const { send } = require("../../helpers/send");
const {
  getPipesService,
  updatePipesService,
  getProgressService,
  deletePipe,
  addPipesService,
  getForecastService,
  addForecastService,
  deleteForecastService,
  getProgressDataService,
  checkIfPipeExists,
} = require("./feed.services");
// const { saveFeedWeight } = require("../../node_cron/pipes");

exports.getProgress = async (req, res) => {
  try {
    const progress = await getProgressService();
    return send(res, true, progress);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.getAllPipes = async (req, res) => {
  try {
    const resRows = await getPipesService();
    const rows = fillType(resRows);
    return send(res, true, rows);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.getForecast = async (req, res) => {
  //Get del forecast del feed
  try {
    const feedForecast = await getForecastService();
    return send(res, true, feedForecast);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.getProgressData = async (req, res) => {
  //Get del progreso del feed para montar la grafica
  try {
    const FeedProgress = await getProgressDataService();
    return send(res, true, FeedProgress);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.submitPipes = async (req, res) => {
  const { data } = req.body;
  try {
    await updatePipesService(data);
    send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.addPipes = async (req, res) => {
  const { data } = req.body;
  try {
    for (let i = 0; i < data.length; i++) {
      const exists = await checkIfPipeExists(data[i]);
      if (exists) return send(res, false, "Some pipe does already exist");
    }
    data.forEach(async (pipe, i) => {
      await addPipesService(pipe, i);
    });
    send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.submitForecast = async (req, res) => {
  const { data } = req.body;
  try {
    await addForecastService(data);
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
    send(res, true, del);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.deleteForecast = async (req, res) => {
  const { week } = req.params;
  try {
    await deleteForecastService(week);
    return send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};
