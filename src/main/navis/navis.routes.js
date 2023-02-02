const router = require("express").Router(),
  controller = require("./navis.controller");

router.get("/get_navis_select", controller.getNavisSelect);

module.exports = router;