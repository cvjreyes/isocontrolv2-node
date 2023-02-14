const router = require("express").Router(),
  controller = require("./notifications.controller");

router.get("/get_last_10", controller.getLast10);

module.exports = router;
