const pool = require("../../../config/db");

exports.getLast10Service = async () => {
  const [notifications] = await pool.query(
    "SELECT * FROM notifications LIMIT 10"
  );
  return notifications;
};
