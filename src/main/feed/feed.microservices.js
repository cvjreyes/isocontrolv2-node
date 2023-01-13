const pool = require("../../../config/db");

exports.getAreaId = async (area) => {
  const [area_id] = await pool.query(
    "SELECT id FROM areas WHERE name = ?",
    area.trim()
  );
  if (!area_id[0].id) throw new Error("Area ID is incorrect");
  return area_id[0].id;
};

exports.getLineRefno = async (line_ref) => {
  const [refno] = await pool.query(
    "SELECT refno FROM `lines` WHERE tag = ?",
    line_ref.trim()
  );
  if (!refno[0].refno) throw new Error("Line reference is incorrect");
  return refno[0].refno;
};

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
