const router = require("express").Router(),
  controller = require("./ifc.controller"),
  { checkAuth } = require("../../middlewares/checkAuth");

router.get("/get_progress", checkAuth, controller.getProgress);

router.get("/get_some_pipes/:trashed", checkAuth, controller.getPipes);

router.get("/get_my_pipes", checkAuth, controller.getMyPipes);

router.get(
  "/get_pipes_from_tray/:status",
  checkAuth,
  controller.getPipesFromTray
);

router.get(
  "/get_pipes_with_action/:action",
  checkAuth,
  controller.getPipesWithAction
);

router.get(
  "/fill_process_owner/:process_owner",
  checkAuth,
  controller.fillProcessOwner
);

router.get("/get_pipe_info/:pipe_id", checkAuth, controller.getPipeInfo);

router.get("/get_files/:pipe_id", checkAuth, controller.getFiles);

router.post("/claim_pipes", checkAuth, controller.claimPipes);

router.post("/unclaim_pipes", checkAuth, controller.unclaimPipes);

router.post("/next_step", checkAuth, controller.nextStep);

router.post("/return", checkAuth, controller.previousStep);

router.post("/update_pipe", checkAuth, controller.updatePipe);

router.post("/upload_file/:pipe_id/:title", checkAuth, controller.uploadFile);

router.post("/update_file/:pipe_id/:title", checkAuth, controller.updateFile);

router.post("/restore_pipes", checkAuth, controller.restorePipes);

router.post("/return_to_tray", checkAuth, controller.returnToTray);

router.post("/revision", checkAuth, controller.revision);

router.post("/claim_process", checkAuth, controller.claimProcess);

module.exports = router;
