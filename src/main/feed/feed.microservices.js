const pool = require("../../../config/db");

exports.addPipeToIFD = async (pipe, area_id, line_refno) => {
  const [res] = await pool.query(
    "INSERT INTO ifd_pipes (line_refno, feed_id, area_id, diameter, train, status) VALUES (?, ?, ?, ?, ?, ?)",
    [line_refno, pipe.id, area_id, pipe.diameter, pipe.train, "ESTIMATED"]
  );
  return res;
};

exports.removePipeFromIFD = async (id) => {
  const [res] = await pool.query("DELETE FROM ifd_pipes WHERE feed_id = ?", id);
  return res;
};
