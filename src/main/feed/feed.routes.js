const router = require("express").Router(),
  controller = require("./feed.controller"),
  { checkAuth } = require("../../middlewares/checkAuth");

router.get("/get_progress", checkAuth, controller.getProgress);

router.get("/get_all_pipes", checkAuth, controller.getAllPipes);

router.get("/get_forecast", checkAuth, controller.getForecast);

router.get("/get_progress_data", checkAuth, controller.getProgressData);

router.post("/submit_pipes", checkAuth, controller.submitPipes);

router.post("/add_pipes", checkAuth, controller.addPipes);

router.post("/submit_forecast", checkAuth, controller.submitForecast);

router.delete("/delete_pipe/:id", checkAuth, controller.deletePipe);

router.delete("/delete_forecast/:week", checkAuth, controller.deleteForecast);

module.exports = router;
