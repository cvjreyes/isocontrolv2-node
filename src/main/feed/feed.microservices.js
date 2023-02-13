const pool = require("../../../config/db");

exports.getPipeService = async (id) => {
  const [pipe] = await pool.query("SELECT * FROM feed_pipes WHERE id = ?", id);
  return pipe[0];
};

exports.addPipeToIFD = async (pipe, area_id, line_refno) => {
  const [res] = await pool.query(
    "INSERT INTO ifd_pipes (line_refno, feed_id, area_id, train, status) VALUES (?, ?, ?, ?, ?)",
    [line_refno, pipe.id, area_id, pipe.train, "FEED_ESTIMATED"]
  );
  return res;
};

exports.removePipeFromIFD = async (id) => {
  const [res] = await pool.query("DELETE FROM ifd_pipes WHERE feed_id = ?", id);
  return res;
};

exports.updatePipeInIFD = async (pipe, area_id) => {
  const [res] = await pool.query(
    "UPDATE ifd_pipes SET line_refno = ?, area_id = ?, train = ? WHERE feed_id = ?",
    [pipe.line_refno, area_id, pipe.train, pipe.id]
  );
  return res;
};

exports.addPipeFromFeedService = async (pipe, id, area, line_refno) => {
  await pool.query(
    "INSERT INTO ifd_pipes (line_refno, feed_id, area_id, train, status) VALUES (?, ?, ?, ?, ?)",
    [line_refno, id, area, pipe.train, "FEED_ESTIMATED"]
  );
};
