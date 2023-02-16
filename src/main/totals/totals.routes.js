const router = require("express").Router(),
  controller = require("./totals.controller");

router.get("/get_all", controller.getAllTotals);

router.get("/:section", controller.getTotal);

router.post("/update", controller.update);

module.exports = router;
