const pool = require("../../../config/db");
const { getAreaId, getLineRefno } = require("../../helpers/pipes");
const { withTransaction } = require("../../helpers/withTransaction");
const { addPipeToIFD } = require("./feed.microservices");

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

exports.updateFeedPipesService = async (data) => {
  return await data.forEach(async (pipe) => {
    const area_id = await getAreaId(pipe.area);
    const line_refno = await getLineRefno(pipe.line_reference);
    const { ok } = await withTransaction(
      async () =>
        await pool.query(
          "UPDATE feed_pipes SET line_refno = ?, area_id = ?, diameter = ?, train = ?, status = ? WHERE id = ?",
          [line_refno, area_id, pipe.diameter, pipe.train, pipe.status, pipe.id]
        )
    );
    if (pipe.status.includes("MODELLED")) {
      await addPipeToIFD(pipe, area_id, line_refno);
    }
    if (ok) return true;
    throw new Error("Something went wrong updating feed pipes");
  });
};

exports.deletePipe = async (id) => {
  const [pipes] = await pool.query("DELETE FROM feed_pipes WHERE id = ?", id);
  return pipes;
};

exports.addPipesService = async (pipe, i) => {
  const area_id = await getAreaId(pipe.area);
  const line_refno = await getLineRefno(pipe.line_reference);
  await pool.query(
    "INSERT INTO feed_pipes (line_refno, area_id, diameter, train, status) VALUES (?, ?, ?, ?, ?)",
    [line_refno, area_id, pipe.diameter, pipe.train, pipe.status]
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
