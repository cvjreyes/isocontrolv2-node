const pool = require("../../../config/db");
const { withTransaction } = require("../../helpers/withTransaction");
const { getAreaId, getLineRefno } = require("./feed.microservices");

exports.getProgressService = async (tableName) => {
  const [pipes] = await pool.query(`SELECT status FROM ${tableName}`);
  if (!pipes[0]) return 0;
  let total = 0;
  pipes.forEach(({ status }) => {
    if (status === "MODELLING(50%)") {
      total += 50;
    } else if (status === "TOCHECK(80%)") {
      total += 80;
    } else if (status === "MODELLED(100%)") {
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
    if (ok) return true;
    throw new Error("Something went wrong updating feed pipes");
  });
};

exports.deletePipe = async (id) => {
  const [pipes] = await pool.query("DELETE FROM feed_pipes WHERE id = ?", id);
  return pipes;
};

exports.addPipesService = async (data) => {
  data.forEach(async (pipe) => {
    const area_id = await getAreaId(pipe.area);
    const line_refno = await getLineRefno(pipe.line_reference);
    const { ok } = await withTransaction(
      async () =>
        await pool.query(
          "INSERT INTO feed_pipes (line_refno, area_id, diameter, train, status) VALUES (?, ?, ?, ?, ?)",
          [line_refno, area_id, pipe.diameter, pipe.train, pipe.status]
        )
    );
    if (ok) return true;
    throw new Error("Something went wrong updating feed pipes");
  });
};
