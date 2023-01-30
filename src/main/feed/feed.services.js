const pool = require("../../../config/db");
const { withTransaction } = require("../../helpers/withTransaction");
const { getAreaId, getLineRefno } = require("../../helpers/pipes");
const { addPipeToIFD, removePipeFromIFD } = require("./feed.microservices");

exports.getProgressService = async (tableName) => {
  const [pipes] = await pool.query(`SELECT status FROM ${tableName}`);
  if (!pipes[0]) return 0;
  let total = 0;
  pipes.forEach(({ status }) => {
    if (status.includes("MODELLING(50%)")) {
      total += 50;
    } else if (status.includes("TOCHECK(80%)")) {
      total += 80;
    } else if (status.includes("MODELLED(100%)")) {
      total += 100;
    }
  });

  return (total / pipes.length).toFixed(2);
};

exports.getFeedPipesService = async () => {
  const [pipes] = await pool.query(
    "SELECT * FROM feed_pipes_view ORDER BY id DESC"
  );
  return pipes;
};

exports.getFeedForecastService = async () => {
  const [pipes] = await pool.query(
    "SELECT * FROM feed_forecast ORDER BY id DESC"
  );
  return pipes;
};

exports.getGFeedService = async () => {
  const [pipes] = await pool.query(
    "SELECT gfeed.*, feed_forecast.estimated, feed_forecast.forecast FROM gfeed JOIN feed_forecast ON gfeed.id = feed_forecast.`day`"
  );
  console.log(pipes);
  return pipes;
};

exports.getFEEDPipeService = async (id) => {
  const [pipe] = await pool.query("SELECT * FROM feed_pipes WHERE id = ?", id);
  return pipe[0];
};

exports.updateFeedPipesService = async (data) => {
  return await data.forEach(async (pipe) => {
    const area_id = await getAreaId(pipe.area);
    const line_refno = await getLineRefno(pipe.line_reference);
    const { status: previousStatus } = await this.getFEEDPipeService(pipe.id);
    const { ok } = await withTransaction(
      async () =>
        await pool.query(
          "UPDATE feed_pipes SET line_refno = ?, area_id = ?, diameter = ?, train = ?, status = ? WHERE id = ?",
          [line_refno, area_id, pipe.diameter, pipe.train, pipe.status, pipe.id]
        )
    );
    if (
      pipe.status.toLowerCase().includes("modelled") &&
      !previousStatus.toLowerCase().includes("modelled")
    ) {
      await addPipeToIFD(pipe, area_id, line_refno);
    } else if (
      previousStatus.toLowerCase().includes("modelled") &&
      !pipe.status.toLowerCase().includes("modelled")
    ) {
      await removePipeFromIFD(pipe.id);
    }
    if (ok) return true;
    throw new Error("Something went wrong updating feed pipes");
  });
};

exports.deletePipe = async (id) => {
  const [pipes] = await pool.query("DELETE FROM feed_pipes WHERE id = ?", id);
  return pipes;
};

exports.addFeedPipesService = async (pipe) => {
  const area_id = await getAreaId(pipe.area);
  const line_refno = await getLineRefno(pipe.line_reference);
  const [res] = await pool.query(
    "INSERT INTO feed_pipes (line_refno, area_id, diameter, train, status) VALUES (?, ?, ?, ?, ?)",
    [line_refno, area_id, pipe.diameter, pipe.train, pipe.status]
  );
  if (pipe.status === "MODELLED(100%)"){
    await addPipeFromFeedService(pipe, res.insertId, area_id, line_refno)
  }
  return res;
};

const addPipeFromFeedService = async (pipe, id, area, line_refno) => {
  await pool.query(
    "INSERT INTO ifd_pipes (line_refno, feed_id, area_id, diameter, train, status) VALUES (?, ?, ?, ?, ?, ?)",
    [line_refno, id, area, pipe.diameter, pipe.train, "FEED_ESTIMATED"]
  );
};

exports.addForecastService = async (day, estimated, forecast) => {
  const { ok } = await withTransaction(
    async () =>
      await pool.query(
        "INSERT INTO feed_forecast(day, estimated, forecast) VALUES(?,?,?)",
        [day, estimated, forecast]
      )
  );
  if (ok) return true;
  throw new Error("Something went wrong updating feed pipes");
};
