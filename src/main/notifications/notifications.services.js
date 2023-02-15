const pool = require("../../../config/db");

exports.getLast10Service = async () => {
  const [notifications] = await pool.query(
    "SELECT * FROM notifications ORDER BY id DESC LIMIT 10"
  );
  return notifications;
};

exports.getSomeService = async (count) => {
  const [notifications] = await pool.query(
    "SELECT * FROM notifications ORDER BY id DESC LIMIT ?, ?",
    [Number(count), 20]
  );
  return notifications;
};
