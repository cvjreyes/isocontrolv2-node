const pool = require("../../../config/db");

exports.addFeedPipesFromIFDService = async (pipe) => {
  const [res] = await pool.query(
    "INSERT INTO feed_pipes (line_refno, area_id, train, status) VALUES (?, ?, ?, ?)",
    [pipe.line_refno, pipe.area_id, pipe.train, pipe.status]
  );
  return res;
};

exports.updatePipeInFeed = async (pipe, area_id) => {
  const [res] = await pool.query(
    "UPDATE feed_pipes SET line_refno = ?, area_id = ?, train = ? WHERE id = ?",
    [pipe.line_refno, area_id, pipe.train, pipe.id, pipe.feed_id]
  );
  return res;
};
