const pool = require("../../../config/db");

exports.getAllTotalsService = async () => {};

exports.getTotalService = async () => {
  const [totals] = await pool.query("SELECT page, total FROM total_lines");
  return totals;
};

exports.updateTotalsService = async (data) => {
  for (let i = 0; i < data.length; i++) {
    await pool.query("UPDATE total_lines SET total = ? WHERE page = ?", [
      data[i].total,
      data[i].page,
    ]);
  }
};
