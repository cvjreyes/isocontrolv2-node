const csv = require("csvtojson");

const pool = require("../../config/db");
const { fillType } = require("../helpers/pipes");
const { buildRow, writeFile, fillIFDWeight } = require("./pipes.helper");

exports.getModelledFrom3D = async () => {
  try {
    const results = await csv().fromFile(process.env.NODE_DPIPES_ROUTE);
    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      const [found] = await pool.query(
        "SELECT * FROM ifd_pipes_view WHERE unit = ? AND fluid = ? AND seq = ? AND area = ? AND diameter = ? AND train = ?",
        [
          row.unit,
          row.fluid,
          row.seq,
          row.area,
          Number(row.diameter),
          row.train,
        ]
      );
      if (found[0] && found[0].status.toLowerCase().includes("estimated")) {
        await pool.query(
          "UPDATE ifd_pipes SET status = 'MODELLED' WHERE id = ?",
          found[0].id
        );
      }
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

exports.updateLines = async () => {
  try {
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
  } catch (err) {
    console.error(err);
    throw err;
  }
};

exports.exportModelledPipes = async () => {
  try {
    // prepare data
    const [pipes] = await pool.query("SELECT * FROM ifd_pipes_view");
    let data = "TAGS\nONERROR CONTINUE\n/Cpipes\n";
    pipes.forEach((pipe) => {
      data += buildRow(pipe);
    });
    data += "SAVEWORK\nUNCLAIM ALL\nFINISH";
    const fileName = "test_pml.mac";
    // file operations
    writeFile(data, fileName);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

exports.saveFEEDWeight = async () => {
  try {
    const [results] = await pool.query("SELECT status FROM feed_pipes");
    let max_progress = results.length * 100;
    let progress = 0;
    for (let i = 0; i < results.length; i++) {
      if (results[i].status == "MODELLING(50%)") {
        progress += 50;
      } else if (results[i].status == "TOCHECK(80%)") {
        progress += 80;
      } else if (results[i].status == "MODELLED(100%)") {
        progress += 100;
      }
    }
    await pool.query(
      "INSERT INTO feed_progress(progress, max_progress) VALUES(?,?)",
      [progress, max_progress]
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
};

exports.saveIFDWeight = async () => {
  try {
    const [results] = await pool.query(
      "SELECT calc_notes, diameter, status FROM ifd_pipes_view"
    );
    const data = fillType(results);
    const data2 = fillIFDWeight(data);
    let max_progress = 0;
    let progress = 0;
    for (let i = 0; i < data2.length; i++) {
      max_progress += data2[i].totalWeight;
      progress += data2[i].currentWeight;
    }
    await pool.query(
      "INSERT INTO ifd_progress(progress, max_progress) VALUES(?,?)",
      [progress, max_progress]
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
};
