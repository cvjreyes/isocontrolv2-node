const cron = require("node-cron");
const {
  getModelledFrom3D,
  updateLines,
  exportModelledPipes,
  saveFEEDWeight,
  saveIFDWeight,
} = require("./pipes");

const cronFn = () => {
  cron.schedule("*/10 * * * *", () => {
    getModelledFrom3D();
  });
  cron.schedule("* * * * *", () => {
    // cron.schedule("*/10 * * * *", () => {
    updateLines();
  });
  cron.schedule("*/10 * * * *", () => {
    exportModelledPipes();
  });
  cron.schedule("0 1 * * 5", () => {
    saveFEEDWeight();
    saveIFDWeight();
  });
};

module.exports = () => {
  cronFn();
};
