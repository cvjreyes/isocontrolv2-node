const csv = require("csvtojson");

const pool = require("../../config/db");
const { fillType } = require("../helpers/pipes");
const {
  getLineRefsAllService,
  addLine,
  updateLine,
} = require("../main/lines/lines.service");
const {
  addNotification,
} = require("../main/notifications/notifications.helpers");
const {
  buildRow,
  writeFile,
  fillIFDWeight,
  isEqual,
} = require("./pipes.helper");

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
        await addNotification(
          `Pipe: ${found[0].line_reference} was updated`,
          `This pipe was marked as MODELLED`
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
};

exports.updateLines = async () => {
  try {
    const new_lines = await csv().fromFile(process.env.NODE_LINES_ROUTE);
    const [old_lines] = await getLineRefsAllService();
    for (let i = 0; i < old_lines.length; i++) {
      // find index
      const idx = new_lines.findIndex(
        (line) => old_lines[i].refno === line.refno
      );
      // if exists
      if (idx > -1) {
        // check if changed
        const { title, description } = isEqual(old_lines[i], new_lines[idx]);
        // if changed
        if (description) {
          // update lines DB
          await updateLine(new_lines[idx], old_lines[i].id);
          // update notifications DB
          await addNotification(title, description);
        }
      } else {
        // delete line
        await pool.query("DELETE FROM `lines` WHERE id = ?", old_lines[i].id);
        await addNotification(
          `Line ${old_lines[i].line_reference} was deleted`
        );
      }
    }
    // add lines that are not currently in the DB
    for (let i = 0; i < new_lines.length; i++) {
      // find index
      const idx = old_lines.findIndex(
        (line) => new_lines[i].refno === line.refno
      );
      if (idx === -1) {
        // add it if it doesn't exist
        await addLine(new_lines[i]);
        await addNotification(`Line ${new_lines[i].tag} was added`);
      }
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

exports.exportModelledPipes = async () => {
  try {
    // prepare data
    const [pipes] = await pool.query("SELECT * FROM feed_pipes_view");
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
    const [totalLines] = await pool.query(
      "SELECT * FROM total_lines WHERE page = 'FEED'"
    );
    const [results] = await pool.query("SELECT status FROM feed_pipes");
    let max_progress = totalLines[0]?.total
      ? totalLines[0].total * 100
      : results.length * 100;
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
    const [totalLines] = await pool.query(
      "SELECT * FROM total_lines WHERE page = 'IFD'"
    );
    const [results] = await pool.query(
      "SELECT calc_notes, diameter, status FROM ifd_pipes_view"
    );
    const data = fillType(results);
    const data2 = fillIFDWeight(data);
    const totals = totalLines[0]?.total ? totalLines[0]?.total : data2.length;
    let max_progress = 0;
    let progress = 0;
    for (let i = 0; i < totals; i++) {
      max_progress += data2[i]?.totalWeight || 6;
      progress += data2[i]?.currentWeight || 0;
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
