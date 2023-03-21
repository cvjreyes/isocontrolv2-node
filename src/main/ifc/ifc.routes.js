const router = require("express").Router(),
  controller = require("./ifc.controller"),
  { checkAuth } = require("../../middlewares/checkAuth");

router.get("/get_progress", checkAuth, controller.getProgress);

router.get("/get_some_pipes/:trashed", checkAuth, controller.getPipes);

module.exports = router;
