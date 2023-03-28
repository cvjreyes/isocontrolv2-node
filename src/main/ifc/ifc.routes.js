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

router.get("/get_pipe_info/:pipe_id", checkAuth, controller.getPipeInfo);

router.get("/get_files/:pipe_id", checkAuth, controller.getFiles);

router.post("/claim_pipes", checkAuth, controller.claimPipes);

router.post("/unclaim_pipes", checkAuth, controller.unclaimPipes);

router.post("/next_step", checkAuth, controller.nextStep);

router.post("/return", checkAuth, controller.previousStep);

router.post("/update_pipe", checkAuth, controller.updatePipe);

router.post("/upload_file/:pipe_id/:name", checkAuth, controller.uploadFile);

module.exports = router;
