const pool = require("../../../config/db");

exports.addNotification = async (title, description) => {
  await pool.query(
    "INSERT INTO notifications (title, description) VALUES (?, ?)",
    [title, description]
  );
};
