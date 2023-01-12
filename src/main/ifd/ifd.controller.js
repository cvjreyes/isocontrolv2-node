const pool = require("../../../config/db");
const { send } = require("../../helpers/send");
const { deletePipe, getPipesService } = require("./ifd.services.js");

exports.getProgress = async (req, res) => {
  try {
    // const users = await findAllUsersService();
    let estimated_weight = 0,
      progress = 0;
    //Select del diametro y CN de las lineas
    const [res1] = await pool.query(
      "SELECT diameter, calc_notes FROM estimated_pipes LEFT JOIN `lines` on estimated_pipes.line_ref_id = `lines`.id"
    );
    if (!res1[0]) return;

    for (let i = 0; i < res1.length; i++) {
      if (res1[i].calc_notes !== "NA" && res1[i].calc_notes !== "unset") {
        estimated_weight += 10;
      } else if (
        (process.env.NODE_MMDN == 1 && res1[i].diameter < 2.0) ||
        (process.env.NODE_MMDN == 0 && res1[i].diameter < 50)
      ) {
        estimated_weight += 3;
      } else {
        estimated_weight += 5;
      }
    }

    //Cogemos el peso actual de las lineas modeladas
    const [res3] = await pool.query(
      "SELECT stage1 as weight, valves, instruments FROM pipectrls LEFT JOIN pestpipes ON status_id = pestpipes.id"
    );
    let weight = 0;
    if (!res3[0]) return;
    for (let i = 0; i < res3.length; i++) {
      weight += res3[i].weight;
      if (res3[i].valves || res3[i].instruments) {
        weight += 1;
      }
    }
    const [res4] = await pool.query(
      "SELECT diameter, calc_notes FROM estimated_pipes_view LEFT JOIN `lines` ON estimated_pipes_view.line_reference = `lines`.tag WHERE status COLLATE utf8mb4_unicode_ci = ?",
      ["ESTIMATED"]
    );
    if (!res4[0]) return;

    for (let i = 0; i < res4.length; i++) {
      if (
        res4[i].calc_notes != "unset" &&
        res4[i].calc_notes != "" &&
        res4[i].calc_notes
      ) {
        weight += 1;
      } else if (res4[i].diameter < 2) {
        weight += 0.5;
      } else {
        weight += 0.3;
      }
    }
    progress = ((weight / estimated_weight) * 100).toFixed(2);
    console.log(progress);
    return send(res, true, progress);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.getIFDPipes = async (req, res) => {
  try {
    const pipes = await getPipesService();
    send(res, true, pipes);
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
