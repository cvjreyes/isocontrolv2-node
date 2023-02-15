const pool = require("../../../config/db");

exports.addNotification = async (title, description) => {
  await pool.query(
    "INSERT INTO notifications (title, description) VALUES (?, ?)",
    [title, description]
  );
};

exports.getTotalRows = async (table) => {
  const [total] = await pool.query(`SELECT COUNT(id) FROM ${table}`);
  return total[0]["COUNT(id)"];
};
