const router = require("express").Router(),
  controller = require("./ifd.controller"),
  { checkAuth } = require("../../middlewares/checkAuth");

router.get("/get_progress", checkAuth, controller.getProgress);

router.get("/get_ifd_pipes", checkAuth, controller.getIFDPipes);

router.post("/submit_ifd_pipes", checkAuth, controller.submitIFDPipes);

router.delete("/delete_pipe/:id", checkAuth, controller.deletePipe);

module.exports = router;
