const router = require("express").Router(),
  controller = require("./areas.controller"),
  { checkAuth } = require("../../middlewares/checkAuth");

router.get("/get_all", checkAuth, controller.getAllAreas);

module.exports = router;
