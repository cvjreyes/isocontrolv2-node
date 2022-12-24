const pool = require("../../config/db");

exports.getProgressService = async (tableName) => {
  const [pipes] = await pool.query(`SELECT status FROM ${tableName}`);
  if (!pipes[0]) return 0;
  let total = 0;
  pipes.forEach(({ status }) => {
    if (status === "MODELLING(50%)") {
      total += 50;
    } else if (status === "TOCHECK(80%)") {
      total += 80;
    } else if (status === "MODELLED(100%)") {
      total += 100;
    }
  });

  return (total / pipes.length).toFixed(2);
};
