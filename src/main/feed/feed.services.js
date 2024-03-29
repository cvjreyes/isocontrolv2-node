const pool = require("../../../config/db");

const { withTransaction } = require("../../helpers/withTransaction");
const { getAreaId } = require("../../helpers/pipes");
const {
  addPipeToIFD,
  removePipeFromIFD,
  updatePipeInIFD,
  getPipeService,
  addPipeFromFeedService,
} = require("./feed.microservices");

exports.getProgressService = async () => {
  const [pipes] = await pool.query(`SELECT status FROM feed_pipes`);
  const [totalLines] = await pool.query(
    "SELECT * FROM total_lines WHERE page = 'FEED'"
  );
  if (!pipes[0]) return 0;
  let total = 0;
  pipes.forEach(({ status }) => {
    if (status.includes("MODELLING(50%)")) {
      total += 50;
    } else if (status.includes("TOCHECK(80%)")) {
      total += 80;
    } else if (status.includes("MODELLED(100%)")) {
      total += 100;
    } else if (status.includes("ESTIMATED")) {
      total += 10;
    }
  });
  return (total / (totalLines[0]?.total || pipes.length)).toFixed(2);
};

exports.getPipesService = async () => {
  const [pipes] = await pool.query(
    "SELECT * FROM feed_pipes_view ORDER BY id DESC"
  );
  return pipes;
};

exports.getForecastService = async () => {
  const [pipes] = await pool.query(
    "SELECT * FROM feed_forecast ORDER BY week DESC"
  );
  return pipes;
};

exports.getProgressDataService = async () => {
  const [pipes] = await pool.query(
    "SELECT feed_progress.*, feed_forecast.estimated, feed_forecast.forecast FROM feed_progress JOIN feed_forecast ON feed_progress.id = feed_forecast.`week` ORDER BY id ASC"
  );
  return pipes;
};

exports.updatePipesService = async (data) => {
  return await data.forEach(async (pipe) => {
    const area_id = await getAreaId(pipe.area);
    const { status: previousStatus } = await getPipeService(pipe.id);
    const { ok } = await withTransaction(
      async () =>
        await pool.query(
          "UPDATE feed_pipes SET line_refno = ?, area_id = ?, train = ?, status = ? WHERE id = ?",
          [pipe.line_refno, area_id, pipe.train, pipe.status, pipe.id]
        )
    );
    if (
      pipe.status.toLowerCase().includes("modelled") &&
      !previousStatus.toLowerCase().includes("modelled")
    ) {
      await addPipeToIFD(pipe, area_id, pipe.line_refno);
    } else if (
      previousStatus.toLowerCase().includes("modelled") &&
      !pipe.status.toLowerCase().includes("modelled")
    ) {
      await removePipeFromIFD(pipe.id);
    } else {
      await updatePipeInIFD(pipe, area_id);
    }
    if (ok) return true;
    throw new Error("Something went wrong updating feed pipes");
  });
};

exports.checkIfPipeExists = async (pipe) => {
  const [found] = await pool.query(
    "SELECT * FROM feed_pipes_view WHERE unit = ? AND fluid = ? AND seq = ? AND area = ? AND diameter = ? AND train = ?",
    [
      pipe.unit,
      pipe.fluid,
      pipe.seq,
      pipe.area,
      Number(pipe.diameter),
      pipe.train,
    ]
  );
  return !!found[0];
};

exports.addPipesService = async (pipe) => {
  const area_id = await getAreaId(pipe.area);
  const [res] = await pool.query(
    "INSERT INTO feed_pipes (line_refno, area_id, train, status) VALUES (?, ?, ?, ?)",
    [pipe.line_refno, area_id, pipe.train, pipe.status]
  );
  if (pipe.status === "MODELLED(100%)") {
    await addPipeFromFeedService(pipe, res.insertId, area_id, pipe.line_refno);
  }
  return res;
};

exports.addForecastService = async (data) => {
  try {
    data.forEach(async (item) => {
      await pool.query("CALL add_feed_forecast (?, ?, ?)", [
        item.week,
        item.estimated,
        item.forecast,
      ]);
    });
    return true;
  } catch (err) {
    console.error(err);
    throw new Error("Something went wrong updating feed pipes");
  }
};

exports.deletePipe = async (id) => {
  const [pipes] = await pool.query("DELETE FROM feed_pipes WHERE id = ?", id);
  await pool.query("DELETE FROM ifd_pipes WHERE feed_id = ?", id);
  return pipes;
};

exports.deleteForecastService = async (week) => {
  await pool.query("DELETE FROM feed_forecast WHERE week = ?", week);
};
