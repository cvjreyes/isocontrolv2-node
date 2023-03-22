const pool = require("../../../config/db");
const { send } = require("../../helpers/send");
const { checkIfPipeExists } = require("../feed/feed.services");
const {
  deletePipe,
  getPipesService,
  updatePipesService,
  addPipesService,
  getPipesFromTrayService,
  claimPipesService,
  getMyPipesService,
  nextStepService,
  previousStepService,
  changeActionsService,
  restorePipesService,
  getProgressService,
  getForecastService,
  addForecastService,
} = require("./ifd.services.js");
const { progressNumbers } = require("./progressNumbers");

exports.getProgress = async (req, res) => {
  let totalWeight = 0;
  let currentWeight = 0;

  const weights = {
    TL1: 6,
    TL2: 10,
    TL3: 20,
  };

  try {
    const [data] = await pool.query(
      "SELECT status, calc_notes, diameter FROM ifd_pipes_view WHERE trashed = 0"
    );
    const [totalLines] = await pool.query(
      "SELECT * FROM total_lines WHERE page = 'IFD'"
    );
    const total = totalLines[0]?.total || data.length;
    for (let i = 0; i < total; i++) {
      let type;
      if (!data[i]?.calc_notes) {
      } else if (
        data[i].calc_notes !== "NA" ||
        data[i].calc_notes !== "unset"
      ) {
        type = "TL3";
      } else if (
        (process.env.NODE_NPSDN == "0" && data[i].diameter < 2.0) ||
        (process.env.NODE_NPSDN == "1" && data[i].diameter < 50)
      ) {
        type = "TL1";
      } else {
        type = "TL2";
      }
      const percentage = !type
        ? 0
        : progressNumbers[type][
            data[i].status.toLowerCase().replace("*", "")
          ] || 10;
      totalWeight += weights[type] || 6;
      currentWeight += (percentage * (weights[type] || 6)) / 100;
    }
    const progress = !totalWeight
      ? 0
      : ((currentWeight / totalWeight) * 100).toFixed(2);
    return send(res, true, progress);
  } catch (err) {
    console.error(err);
    send(res, false, err);
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

exports.getMyPipes = async (req, res) => {
  const { user_id } = req;
  try {
    const pipes = await getMyPipesService(user_id);
    send(res, true, pipes);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.getPipesFromTray = async (req, res) => {
  const { status } = req.params;
  try {
    const pipes = await getPipesFromTrayService(status);
    send(res, true, pipes);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.getProgressData = async (req, res) => {
  //Get del progreso del feed para montar la grafica
  try {
    const IFDProgress = await getProgressService();
    return send(res, true, IFDProgress);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.getForecast = async (req, res) => {
  //Get del forecast del feed
  try {
    const ifdForecast = await getForecastService();
    return send(res, true, ifdForecast);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.claimPipes = async (req, res) => {
  const { data } = req.body;
  const user_id = req.user_id;
  try {
    await claimPipesService(data, user_id);
    send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.unclaimPipes = async (req, res) => {
  const { data } = req.body;
  try {
    await claimPipesService(data, null);
    send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.submitPipes = async (req, res) => {
  const { data } = req.body;
  try {
    await updatePipesService(data);
    // if status is modelled => añadir a ifd_pipes
    send(res, true);
    // this.getFeedPipes(req, res);
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
    await data.forEach(async (pipe, i) => {
      await addPipesService(pipe, i);
    });
    send(res, true);
  } catch (er) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.nextStep = async (req, res) => {
  const { data } = req.body;
  try {
    await nextStepService(data);
    send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.previousStep = async (req, res) => {
  const { data } = req.body;
  try {
    await previousStepService(data);
    send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.changeActions = async (req, res) => {
  const { data } = req.body;
  try {
    await changeActionsService(data);
    send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.restorePipes = async (req, res) => {
  const { data } = req.body;
  try {
    await restorePipesService(data);
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
