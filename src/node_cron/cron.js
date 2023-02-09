const cron = require("node-cron");
const {
  getModelledFrom3D,
  updateLines,
  exportModelledPipes,
  saveFeedWeight,
} = require("./pipes");

const cronFn = () => {
  cron.schedule("*/10 * * * *", () => {
    getModelledFrom3D();
  });
  cron.schedule("*/10 * * * *", () => {
    updateLines();
  });
  cron.schedule("*/10 * * * *", () => {
    exportModelledPipes();
  });
  cron.schedule("0 1 * * 5", () => {
    saveFeedWeight();
  });
};

module.exports = () => {
  cronFn();
};
