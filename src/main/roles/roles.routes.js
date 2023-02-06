const router = require("express").Router(),
  controller = require("./roles.controller");

router.get("/get_all", controller.getAllRoles);

module.exports = router;
