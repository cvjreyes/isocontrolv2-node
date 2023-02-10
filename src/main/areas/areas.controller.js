const pool = require("../../../config/db");
const { send } = require("../../helpers/send");
const { getAreasService } = require("./areas.services");

exports.getAllAreas = async (req, res) => {
  try {
    const areas = await getAreasService();
    send(res, true, areas);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};
