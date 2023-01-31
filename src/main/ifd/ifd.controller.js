const pool = require("../../../config/db");
const { send } = require("../../helpers/send");
const {
  deletePipe,
  getPipesService,
  updateIFDPipesService,
  addIFDPipesService,
  getPipesFromTrayService,
  claimIFDPipesService,
  getMyPipesService,
  nextStepService,
  previousStepService,
  changeActionsService,
  restoreIFDPipesService,
} = require("./ifd.services.js");
const { progressNumbers } = require("../../helpers/progressNumbers");

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
    for (let i = 0; i < data.length; i++) {
      let type;
      if (data[i].calc_notes !== "NA" || data[i].calc_notes !== "unset") {
        type = "TL3";
      } else if (
        (process.env.NODE_NPSDN == "0" && data[i].diameter < 2.0) ||
        (process.env.NODE_NPSDN == "1" && data[i].diameter < 50)
      ) {
        type = "TL1";
      } else {
        type = "TL2";
      }
      const percentage =
        progressNumbers[type][data[i].status.toLowerCase().replace("*", "")] ||
        0;
      totalWeight += weights[type];
      currentWeight += (percentage * weights[type]) / 100;
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

exports.getIFDPipes = async (req, res) => {
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

exports.getIFDPipesFromTray = async (req, res) => {
  const { status } = req.params;
  try {
    const pipes = await getPipesFromTrayService(status);
    send(res, true, pipes);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.submitIFDPipes = async (req, res) => {
  const { data } = req.body;
  try {
    await updateIFDPipesService(data);
    // if status is modelled => añadir a ifd_pipes
    send(res, true);
    // this.getFeedPipes(req, res);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.claimIFDPipes = async (req, res) => {
  const { data } = req.body;
  const user_id = req.user_id;
  try {
    await claimIFDPipesService(data, user_id);
    send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.unclaimIFDPipes = async (req, res) => {
  const { data } = req.body;
  try {
    await claimIFDPipesService(data, null);
    send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.addPipes = async (req, res) => {
  const { data } = req.body;
  try {
    await data.forEach(async (pipe, i) => {
      await addIFDPipesService(pipe, i);
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

exports.restoreIFDPipes = async (req, res) => {
  const { data } = req.body;
  try {
    await restoreIFDPipesService(data);
    send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};
