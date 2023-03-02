const cron = require("node-cron");
const {
  getModelledFrom3D,
  updateLines,
  exportModelledPipes,
  saveFEEDWeight,
  saveIFDWeight,
} = require("./pipes");

const cronFn = () => {
  // cron.schedule("* * * * *", () => {
  cron.schedule("*/10 * * * *", () => {
    getModelledFrom3D();
    console.info(
      new Date(Date.now()).toLocaleDateString(),
      new Date(Date.now()).toLocaleTimeString(),
      "Modelled updated"
    );
  });
  // cron.schedule("* * * * *", () => {
  cron.schedule("*/10 * * * *", () => {
    updateLines();
    console.info(
      new Date(Date.now()).toLocaleDateString(),
      new Date(Date.now()).toLocaleTimeString(),
      "Lines updated"
    );
  });
  // cron.schedule("* * * * *", () => {
  cron.schedule("*/10 * * * *", () => {
    exportModelledPipes();
    console.info(
      new Date(Date.now()).toLocaleDateString(),
      new Date(Date.now()).toLocaleTimeString(),
      "Modelled pipes exported"
    );
  });
  // cron.schedule("* * * * *", () => {
  cron.schedule("0 1 * * 5", () => {
    saveFEEDWeight();
    saveIFDWeight();
    console.info(
      new Date(Date.now()).toLocaleDateString(),
      new Date(Date.now()).toLocaleTimeString(),
      "Progresses updated"
    );
  });
};

module.exports = () => {
  cronFn();
};
