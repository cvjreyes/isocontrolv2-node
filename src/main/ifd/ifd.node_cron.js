const cron = require("node-cron");
const csv = require("csvtojson");
const pool = require("../../../config/db");

const getModelledFrom3D = async () => {
  const results = await csv().fromFile(process.env.NODE_DPIPES_ROUTE);
  for (let i = 0; i < results.length; i++) {
    const row = results[i];
    const [found] = await pool.query(
      "SELECT * FROM ifd_pipes_view WHERE unit = ? AND fluid = ? AND seq = ? AND area = ? AND diameter = ? AND train = ?",
      [row.unit, row.fluid, row.seq, row.area, Number(row.diameter), row.train]
    );
    if (found[0] && found[0].status.toLowerCase().includes("estimated")) {
      await pool.query(
        "UPDATE ifd_pipes SET status = 'MODELLED' WHERE id = ?",
        found[0].id
      );
    }
  }
};

const cronFn = () => {
  cron.schedule("*/5 * * * *", () => {
    getModelledFrom3D();
  });
};

module.exports = () => {
  cronFn();
};
