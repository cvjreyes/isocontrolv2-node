const router = require("express").Router(),
  controller = require("./ifd.controller"),
  { checkAuth } = require("../../middlewares/checkAuth");

router.get("/get_progress", checkAuth, controller.getProgress);

module.exports = router;
