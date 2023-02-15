const router = require("express").Router(),
  controller = require("./notifications.controller");

router.get("/get_last_10", controller.getLast10);

router.get("/get_some/:count", controller.getSome);

module.exports = router;
