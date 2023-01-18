const pool = require("../../config/db");
const { progressNumbers } = require("./progressNumbers");

exports.fillType = (data) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].calc_notes === "NA" || data[i].calc_notes === "unset") {
      if (process.env.NODE_NPSDN == "0") {
        if (data[i].diameter < 2.0) data[i].type = "TL1";
        else data[i].type = "TL2";
      } else {
        if (data[i].diameter < 50) data[i].type = "TL1";
        else data[i].type = "TL2";
      }
    } else data[i].type = "TL3";
  }
  return data;
};

exports.fillProgress = (data) => {
  return data.map((item) => ({
    ...item,
    progress: progressNumbers[item.type][item.tray],
  }));
};

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
    "SELECT refno FROM `lines` WHERE line_reference = ?",
    line_ref.trim()
  );
  if (!refno[0].refno) throw new Error("Line reference is incorrect");
  return refno[0].refno;
};

exports.getOwnerId = async (name) => {
  const [owner] = await pool.query("SELECT id FROM users WHERE name = ?", name);
  if (!owner[0].id) throw new Error("Line reference is incorrect");
  return owner[0].id;
};
