const pool = require("../../../config/db");
const {
  fillType,
  getAreaId,
  getLineRefno,
  getOwnerId,
} = require("../../helpers/pipes");
const { withTransaction } = require("../../helpers/withTransaction");

exports.getPipesService = async () => {
  const [resRows] = await pool.query("SELECT * FROM ifd_pipes_view");
  const rows = fillType(resRows);
  return rows;
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
