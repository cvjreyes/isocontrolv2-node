const pool = require("../../../config/db");
const { send } = require("../../helpers/send");
const {
  deletePipe,
  getPipesService,
  updateIFDPipesService,
  addPipesService,
  getPipesFromTrayService,
  claimIFDPipesService,
  getMyPipesService,
} = require("./ifd.services.js");

exports.getProgress = async (req, res) => {
  // 1 calcular tipo de línea
  // 2 calcular el total del peso de la sumatoria de líneas
  //   tl1 = 6
  //   tl2 = 10
  //   tl3 = 20
  // 3 calcular según datos de pestpies  p.e. TL1 Modelled = weight 3 / 6 ( 50% )

  try {
    // const users = await findAllUsersService();
    let estimated_weight = 0,
      progress = 0;
    //Select del diametro y CN de las lineas
    const [res1] = await pool.query(
      "SELECT `diameter`, `calc_notes` FROM ifd_pipes LEFT JOIN `lines` on ifd_pipes.line_refno = `lines`.refno"
    );
    if (!res1[0]) return;
    for (let i = 0; i < res1.length; i++) {
      if (res1[i].calc_notes !== "NA" && res1[i].calc_notes !== "unset") {
        estimated_weight += 10;
      } else if (
        (process.env.NODE_NPSDN == 1 && res1[i].diameter < 2.0) ||
        (process.env.NODE_NPSDN == 0 && res1[i].diameter < 50)
      ) {
        estimated_weight += 3;
      } else {
        estimated_weight += 5;
      }
    }
    //Cogemos el peso actual de las lineas modeladas
    const [res2] = await pool.query(
      "SELECT stage1 as weight, valves, instruments FROM pipectrls LEFT JOIN pestpipes ON status_id = pestpipes.id"
    );
    let weight = 0;
    if (!res2[0]) return;
    for (let i = 0; i < res2.length; i++) {
      weight += res2[i].weight;
      if (res2[i].valves || res2[i].instruments) {
        weight += 1;
      }
    }
    const [res3] = await pool.query(
      "SELECT diameter, calc_notes FROM ifd_pipes_view LEFT JOIN `lines` ON ifd_pipes_view.line_reference = `lines`.line_reference WHERE status COLLATE utf8mb4_unicode_ci = ?",
      ["ESTIMATED"]
    );
    if (!res3[0]) return;

    for (let i = 0; i < res3.length; i++) {
      if (res3[i].calc_notes != "unset" && res3[i].calc_notes) {
        weight += 1;
      } else if (res3[i].diameter < 2) {
        weight += 0.5;
      } else {
        weight += 0.3;
      }
    }
    // progress = ((weight / estimated_weight) * 100).toFixed(2);
    progress = (weight / estimated_weight).toFixed(2);
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
      await addPipesService(pipe, i);
    });
    send(res, true);
  } catch (er) {
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
