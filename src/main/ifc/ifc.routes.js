const router = require("express").Router(),
  controller = require("./ifc.controller"),
  { checkAuth } = require("../../middlewares/checkAuth");

router.get("/get_progress", checkAuth, controller.getProgress);

module.exports = router;
