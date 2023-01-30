const pool = require("../../../config/db");
const { send } = require("../../helpers/send");
const { getDiametersService } = require("./diameters.services");

exports.getAllDiameters = async (req, res) => {
  try {
    const diameters = await getDiametersService();
    send(res, true, diameters);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};