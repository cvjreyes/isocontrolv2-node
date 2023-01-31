const cron = require("node-cron");
const csv = require("csvtojson");

const pool = require("../../config/db");
const { buildRow, deleteFile, writeFile, copyFile } = require("./pipes.helper");

const getModelledFrom3D = async () => {
  const results = await csv().fromFile(process.env.NODE_DPIPES_ROUTE);
  for (let i = 0; i < 5; i++) {
    // for (let i = 0; i < results.length; i++) {
    const row = results[i];
    // const [found] = await pool.query(
    //   "SELECT * FROM ifd_pipes_view WHERE unit = ? AND fluid = ? AND seq = ? AND area = ? AND diameter = ? AND train = ?",
    //   [row.unit, row.fluid, row.seq, row.area, Number(row.diameter), row.train]
    // );
    // if (found[0] && found[0].status.toLowerCase().includes("estimated")) {
    //   await pool.query(
    //     "UPDATE ifd_pipes SET status = 'MODELLED' WHERE id = ?",
    //     found[0].id
    //   );
    // }
  }
};

const updateLines = async () => {
  const results = await csv().fromFile(process.env.NODE_LINES_ROUTE);
  await pool.query("TRUNCATE TABLE `lines`");
  for (let i = 0; i < results.length; i++) {
    const line = results[i];
    await pool.query(
      "INSERT INTO `lines` (refno, line_reference, unit, fluid, seq, spec_code, pid, stress_level, calc_notes, insulation, diameter) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        line.refno,
        line.tag,
        line.unit,
        line.fluid,
        line.seq,
        line.spec,
        line.pid,
        line.strlvl,
        line.cnote,
        line.insulation,
        line.diam,
      ]
    );
  }
};

const exportModelledPipes = async () => {
  // prepare data
  const [pipes] = await pool.query("SELECT * FROM ifd_pipes_view");
  let data = "TAGS\nONERROR CONTINUE\n/Cpipes\n";
  pipes.forEach((pipe) => {
    data += buildRow(pipe);
  });
  data += "SAVEWORK\nUNCLAIM ALL\nFINISH";
  const fileName = "test_pml.mac";
  // file operations
  const written = await writeFile(data, fileName);
  if (written) {
    const copied = await copyFile(fileName);
    if (copied) {
      await deleteFile(fileName);
    }
  }
  return;
};

const cronFn = () => {
  // cron.schedule("*/5 * * * *", () => {
  //   getModelledFrom3D();
  // });
  cron.schedule("*/10 * * * *", () => {
    updateLines();
  });
  cron.schedule("*/10 * * * *", () => {
    exportModelledPipes();
  });
};

module.exports = () => {
  cronFn();
};
