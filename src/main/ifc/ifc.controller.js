const multer = require("multer");
const { send } = require("../../helpers/send");
const { buildTag } = require("../../node_cron/pipes.helper");
const {
  countFilesFromPipe,
  deleteFileService,
} = require("../files/files.services");
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
  getFilenameService,
  restorePipesService,
  returnToTrayService,
  revisionService,
  addToIFC,
  getPipesWithActionService,
  claimProcessServices,
} = require("./ifc.services");
const {
  getUserRolesService,
  getUserService,
} = require("../users/user.services");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "files");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
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

exports.getPipesWithAction = async (req, res) => {
  const { action } = req.params;
  try {
    const pipes = await getPipesWithActionService(action);
    send(res, true, pipes);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.fillProcessOwner = async (req, res) => {
  const { process_owner } = req.params;
  try {
    const user = await getUserService(process_owner);
    console.log(user);
    send(res, true, user);
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
    const userRoles = await getUserRolesService(user_id);
    const isSpecialityLead = userRoles.some(
      (x) => x.name === "Speciality Lead"
    );
    const actualData = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const pipe = await getPipeInfoService(row.id);
      actualData[i] = pipe;
    }
    const someOwner = actualData.some((x) => x.owner_id);
    if (someOwner && !isSpecialityLead)
      return send(res, false, "Some pipe is already claimed");
    await claimPipesService(data, user_id);
    send(res, true, "Change ssaved successfully");
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
  const { pipe_id, title } = req.params;
  try {
    uploadFn(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return send(res, false, err);
      } else if (err) {
        return send(res, false, err);
      }
      const pipe = await getPipeInfoService(pipe_id);
      let tag = buildTag(pipe);
      const numOfFiles = await countFilesFromPipe(pipe_id);
      if (title.includes("Clean")) tag += "-CL";
      if (!numOfFiles) await markedAsBlockedInIFD(pipe.feed_id);
      const filename = req.file.filename;
      await addFileService(pipe_id, tag, title, filename);
      return send(res, true);
    });
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.updateFile = async (req, res) => {
  const { pipe_id, title } = req.params;
  try {
    uploadFn(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return send(res, false, err);
      } else if (err) {
        return send(res, false, err);
      }
      const { id } = await getFilenameService(pipe_id, title);
      deleteFileService(id);

      const pipe = await getPipeInfoService(pipe_id);
      let tag = buildTag(pipe);
      await addFileService(pipe_id, tag, title, req.file.filename);

      return send(res, true);
    });
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.restorePipes = async (req, res) => {
  const { data } = req.body;
  try {
    await restorePipesService(data);
    send(res, true);
  } catch (err) {
    console.error(err);
    return send(res, false, err);
  }
};

exports.returnToTray = async (req, res) => {
  const { pipe_id, returnTo } = req.body;
  try {
    await returnToTrayService(pipe_id, returnTo);
    send(res, true);
  } catch (err) {
    console.error(err);
    return;
  }
};

exports.revision = async (req, res) => {
  const { data } = req.body;
  try {
    data.forEach(async (id) => {
      await revisionService(id);
      const pipe = await getPipeInfoService(id);
      await addToIFC(pipe);
    });
    send(res, true);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.claimProcess = async (req, res) => {
  const { data } = req.body;
  const { user_id } = req;
  try {
    data.forEach(async (pipe) => {
      await claimProcessServices(user_id, pipe.id);
    });
    send(res, true);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};
