const router = require("express").Router(),
  controller = require("./user.controller"),
  { checkAuth } = require("../../middlewares/checkAuth");

router.get("/find_all", controller.findAll);

router.get("/get_user_info", checkAuth, controller.getUserInfo);

router.get("/get_owners", checkAuth, controller.getOwners);

router.post("/login", controller.login);

router.post("/change_password", checkAuth, controller.changePassword);

module.exports = router;
