const { send } = require("../../helpers/send");
const { deleteFileService } = require("./files.services");

exports.deleteFile = async (req, res) => {
  const { file_id } = req.params;
  try {
    await deleteFileService(file_id);
    // count num of files
    // if files < 1 => mark toIFC = 0
    return send(res, true);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};
