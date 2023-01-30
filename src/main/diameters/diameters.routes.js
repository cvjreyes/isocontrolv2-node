const router = require("express").Router(),
  controller = require("./diameters.controller"),
  { checkAuth } = require("../../middlewares/checkAuth");

router.get("/get_diameters", checkAuth, controller.getAllDiameters);

module.exports = router;