const { send } = require("../../helpers/send");
const { deleteFileService } = require("./files.services");

exports.deleteFile = async (req, res) => {
  const { file_id } = req.params;
  try {
    await deleteFileService(file_id);
    return send(res, true);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};
