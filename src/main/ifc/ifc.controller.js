const multer = require("multer");
const { send } = require("../../helpers/send");
const { buildTag } = require("../../node_cron/pipes.helper");
const { countFilesFromPipe } = require("../files/files.services");
const { markedAsBlockedInIFD } = require("../ifd/ifd.services");
const {
  getPipesService,
  getPipesFromTrayService,
  claimPipesService,
  getMyPipesService,
  nextStepService,
  previousStepService,
  getPipeInfoService,
  updatePipeService,
  getFilesService,
  addFileService,
} = require("./ifc.services");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "files");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploadFn = multer({
  storage: storage,
  limits: { fieldSize: "256mb" },
}).single("file");

exports.getProgress = async (req, res) => {
  try {
    // const progress = await getProgressService("feed_pipes");
    return send(res, true, 0);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.getPipes = async (req, res) => {
  const { trashed } = req.params;
  try {
    const pipes = await getPipesService(trashed);
    send(res, true, pipes);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.getMyPipes = async (req, res) => {
  const { user_id } = req;
  try {
    const pipes = await getMyPipesService(user_id);
    send(res, true, pipes);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.getPipesFromTray = async (req, res) => {
  const { status } = req.params;
  try {
    const pipes = await getPipesFromTrayService(status);
    send(res, true, pipes);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.getPipeInfo = async (req, res) => {
  const { pipe_id } = req.params;
  try {
    const pipe = await getPipeInfoService(pipe_id);
    send(res, true, pipe);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.getFiles = async (req, res) => {
  const { pipe_id } = req.params;
  try {
    const pipe = await getFilesService(pipe_id);
    send(res, true, pipe);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.claimPipes = async (req, res) => {
  const { data } = req.body;
  const user_id = req.user_id;
  try {
    await claimPipesService(data, user_id);
    send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.unclaimPipes = async (req, res) => {
  const { data } = req.body;
  try {
    await claimPipesService(data, null);
    send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.nextStep = async (req, res) => {
  const { data } = req.body;
  try {
    await nextStepService(data);
    send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.previousStep = async (req, res) => {
  const { data } = req.body;
  try {
    await previousStepService(data);
    send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.updatePipe = async (req, res) => {
  const { key, val, id } = req.body;
  try {
    await updatePipeService(key, val, id);
    send(res, true);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.uploadFile = async (req, res) => {
  const { pipe_id, name } = req.params;
  try {
    uploadFn(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return send(res, false, err);
      } else if (err) {
        return send(res, false, err);
      }
      const pipe = await getPipeInfoService(pipe_id);
      let tag = buildTag(pipe);
      console.log({ tag, name });
      const numOfFiles = await countFilesFromPipe(pipe_id);
      if (name.includes("Clean")) tag += "-CL";
      // let title = name
      //   filename = tag;
      if (!numOfFiles) {
        //   title = "Master";
        // const pipe = await getPipeInfoService(pipe_id);
        await markedAsBlockedInIFD(pipe.feed_id);
        // } else if (req.file.filename.includes("pdf")) {
        //   title = "Clean";
        //   filename += "-CL";
      }
      // filename += req.file.filename.slice(-4);
      await addFileService(pipe_id, tag, name);
      return send(res, true);
    });
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};
