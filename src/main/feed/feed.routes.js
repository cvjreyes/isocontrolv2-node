const router = require("express").Router(),
  controller = require("./feed.controller"),
  { checkAuth } = require("../../middlewares/checkAuth");

router.get("/get_progress", checkAuth, controller.getProgress);

router.get("/get_feed_pipes", checkAuth, controller.getFeedPipes);

router.get("/get_forecast", checkAuth, controller.getFeedForecast);

router.post("/submit_feed_pipes", checkAuth, controller.submitFeedPipes);

router.post("/add_pipes", checkAuth, controller.addPipes);

router.post("/submit_forecast", checkAuth, controller.submitForecast);

router.delete("/delete_pipe/:id", checkAuth, controller.deletePipe);

module.exports = router;
