const router = require("express").Router(),
  controller = require("./feed.controller"),
  { checkAuth } = require("../../middlewares/checkAuth");

router.get("/get_progress", checkAuth, controller.getProgress);

router.get("/get_feed_pipes", checkAuth, controller.getFeedPipes);

router.post("/submit_feed_pipes", checkAuth, controller.submitFeedPipes);

router.delete("/delete_pipe/:id", checkAuth, controller.deletePipe);

module.exports = router;
