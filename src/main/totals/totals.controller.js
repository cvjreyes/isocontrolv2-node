const { send } = require("../../helpers/send");
const {
  getTotalService,
  getAllTotalsService,
  updateTotalsService,
} = require("./totals.service");

exports.getAllTotals = async (req, res) => {
  try {
    const total = await getAllTotalsService();
    return send(res, true, total);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.getTotal = async (req, res) => {
  const { section } = req.params;
  try {
    const total = await getTotalService(section);
    return send(res, true, total);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};

exports.update = async (req, res) => {
  const { totals } = req.body;
  try {
    const result = await updateTotalsService(totals);
    send(res, true);
  } catch (err) {
    console.error(err);
    send(res, false, err);
  }
};
