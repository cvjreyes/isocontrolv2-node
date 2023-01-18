const router = require("express").Router(),
  controller = require("./ifd.controller"),
  { checkAuth } = require("../../middlewares/checkAuth");

router.get("/get_progress", checkAuth, controller.getProgress);

router.get("/get_ifd_pipes", checkAuth, controller.getIFDPipes);

router.get("/get_ifd_pipes_from_tray/:status", checkAuth, controller.getIFDPipesFromTray);

router.post("/claim_ifd_pipes", checkAuth, controller.claimIFDPipes);

router.post("/submit_ifd_pipes", checkAuth, controller.submitIFDPipes);

router.post("/add_pipes", checkAuth, controller.addPipes);

router.delete("/delete_pipe/:id", checkAuth, controller.deletePipe);

module.exports = router;
