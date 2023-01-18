const pool = require("../../../config/db");
const {
  fillType,
  getAreaId,
  getLineRefno,
  getOwnerId,
  fillProgress,
} = require("../../helpers/pipes");
const { withTransaction } = require("../../helpers/withTransaction");
const { addPipesService } = require("../feed/feed.services");

exports.getPipesService = async () => {
  const [resRows] = await pool.query("SELECT * FROM ifd_pipes_view");
  const rows = fillType(resRows);
  return rows;
};

exports.getMyPipesService = async (id) => {
  const [resRows] = await pool.query(
    "SELECT * FROM ifd_pipes_view WHERE owner_id = ? AND status <> ?",
    [id, "ESTIMATED"]
  );
  const rows = fillType(resRows);
  const rowsEnd = fillProgress(rows);
  return rowsEnd;
};

exports.getPipesFromTrayService = async (status) => {
  const [resRows] = await pool.query(
    `SELECT * FROM ifd_pipes_view WHERE status LIKE '${status}%'`
  );
  const rows = fillType(resRows);
  const rowsEnd = fillProgress(rows);
  return rowsEnd;
};

exports.updateIFDPipesService = async (data) => {
  return await data.forEach(async (pipe) => {
    const area_id = await getAreaId(pipe.area);
    const line_refno = await getLineRefno(pipe.line_reference);
    const owner_id = pipe.owner ? await getOwnerId(pipe.owner) : null;
    const { ok } = await withTransaction(
      async () =>
        await pool.query(
          "UPDATE ifd_pipes SET line_refno = ?, area_id = ?, diameter = ?, train = ?, status = ?, feed_id = ?, owner_id = ? WHERE id = ?",
          [
            line_refno,
            area_id,
            pipe.diameter,
            pipe.train,
            pipe.status,
            pipe.id,
            owner_id,
            pipe.id,
          ]
        )
    );
    if (ok) return true;
    throw new Error("Something went wrong updating feed pipes");
  });
};

exports.deletePipe = async (id) => {
  const [pipes] = await pool.query("DELETE FROM ifd_pipes WHERE id = ?", id);
  return pipes;
};

exports.addPipesService = async (pipe) => {
  const area_id = await getAreaId(pipe.area);
  const line_refno = await getLineRefno(pipe.line_reference);
  // añadir pipe en feed_pipes y coger feed_id
  const { insertId } = await addPipesService(pipe);
  const owner_id = await getOwnerId(pipe.owner);
  const res = await pool.query(
    "INSERT INTO ifd_pipes (line_refno, feed_id, area_id, diameter, train, status, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      line_refno,
      insertId,
      area_id,
      pipe.diameter,
      pipe.train,
      pipe.status,
      owner_id,
    ]
  );
  console.log("res: ", res);
  return res;
};

exports.claimIFDPipesService = async (data, user_id) => {
  return await data.forEach(async (pipe) => {
    const { ok } = await withTransaction(
      async () =>
        await pool.query("UPDATE ifd_pipes SET owner_id = ? WHERE id = ?", [
          user_id,
          pipe.id,
        ])
    );
    if (ok) return true;
    throw new Error("Something went wrong claiming feed pipes");
  });
};
