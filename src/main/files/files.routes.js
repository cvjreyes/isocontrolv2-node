const router = require("express").Router(),
  controller = require("./files.controller"),
  { checkAuth } = require("../../middlewares/checkAuth");

router.delete("/delete/:file_id", checkAuth, controller.deleteFile);

module.exports = router;
