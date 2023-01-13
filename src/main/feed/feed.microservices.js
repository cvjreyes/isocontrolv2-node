const pool = require("../../../config/db");

exports.addPipeToIFD = async (pipe, area_id, line_refno) => {
  const [res] = await pool.query(
    "INSERT INTO ifd_pipes (line_refno, tag, feed_id, area_id, diameter, train, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      line_refno,
      pipe.tag,
      pipe.id,
      area_id,
      pipe.diameter,
      pipe.train,
      "ESTIMATED",
    ]
  );
  console.log(res);
  return res;
};
