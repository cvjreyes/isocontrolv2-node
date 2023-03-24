const fs = require("fs");
const pool = require("../../../config/db");

exports.deleteFileService = async (file_id) => {
  const file = await getFileInfo(file_id);
  const path = "./files/" + file.filename;
  fs.unlink(path, function (err) {
    if (err) console.error(err);
    else console.info("Image deleted successfully");
  });
  await pool.query("DELETE FROM files WHERE id = ?", file_id);
};

exports.countFilesFromPipe = async (pipe_id) => {
  const [pipes] = await pool.query(
    "SELECT * FROM files WHERE pipe_id = ?",
    pipe_id
  );
  return pipes.length;
};

const getFileInfo = async (file_id) => {
  const [res] = await pool.query("SELECT * FROM files WHERE id = ?", file_id);
  return res[0];
};
