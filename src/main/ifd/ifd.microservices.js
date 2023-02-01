const pool = require("../../../config/db");

exports.updatePipeInFeed = async (pipe, area_id) => {
  const [res] = await pool.query(
    "UPDATE feed_pipes SET line_refno = ?, area_id = ?, train = ? WHERE id = ?",
    [pipe.line_refno, area_id, pipe.train, pipe.id, pipe.feed_id]
  );
  return res;
};