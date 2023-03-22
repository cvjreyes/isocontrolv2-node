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

router.post("/claim_pipes", checkAuth, controller.claimPipes);

router.post("/unclaim_pipes", checkAuth, controller.unclaimPipes);

module.exports = router;
