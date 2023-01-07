const router = require("express").Router(),
  controller = require("./lines.controller"),
  { checkAuth } = require("../../middlewares/checkAuth");

router.get("/get_lines", checkAuth, controller.getLineRefs);

module.exports = router;
