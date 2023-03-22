const pool = require("../../config/db");
const { progressNumbers } = require("../main/ifd/progressNumbers");

exports.fillType = (data) => {
  for (let i = 0; i < data.length; i++) {
    if (
      data[i].calc_notes &&
      data[i].calc_notes !== "NA" &&
      data[i].calc_notes !== "unset"
    ) {
      data[i].type = "TL3";
    } else if (
      (process.env.NODE_NPSDN === "0" && data[i].diameter < 2) ||
      (process.env.NODE_NPSDN === "1" && data[i].diameter < 50)
    ) {
      data[i].type = "TL1";
    } else {
      data[i].type = "TL2";
    }
  }
  return data;
};

exports.fillProgress = (data) => {
  return data.map((item) => ({
    ...item,
    progress:
      progressNumbers[item.type][
        item.status.toLowerCase().replace("-", "").replace("*", "")
      ],
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

exports.getOwnerId = async (name) => {
  const [owner] = await pool.query("SELECT id FROM users WHERE name = ?", name);
  if (!owner[0].id) throw new Error("Line reference is incorrect");
  return owner[0].id;
};
