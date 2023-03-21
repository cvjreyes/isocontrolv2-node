const router = require("express").Router(),
  controller = require("./ifd.controller"),
  { checkAuth } = require("../../middlewares/checkAuth");

router.get("/get_progress", checkAuth, controller.getProgress);

router.get("/get_some_pipes/:trashed", checkAuth, controller.getPipes);

router.get("/get_my_pipes", checkAuth, controller.getMyPipes);

router.get(
  "/get_pipes_from_tray/:status",
  checkAuth,
  controller.getPipesFromTray
);

router.get("/get_progress_data", checkAuth, controller.getProgressData);

router.get("/get_forecast", checkAuth, controller.getForecast);

router.post("/claim_pipes", checkAuth, controller.claimPipes);

router.post("/unclaim_pipes", checkAuth, controller.unclaimPipes);

router.post("/submit_pipes", checkAuth, controller.submitPipes);

router.post("/add_pipes", checkAuth, controller.addPipes);

router.post("/next_step", checkAuth, controller.nextStep);

router.post("/return", checkAuth, controller.previousStep);

router.post("/change_actions", checkAuth, controller.changeActions);

router.post("/restore_pipes", checkAuth, controller.restorePipes);

router.post("/submit_forecast", checkAuth, controller.submitForecast);

router.delete("/delete_pipe/:id", checkAuth, controller.deletePipe);

module.exports = router;
