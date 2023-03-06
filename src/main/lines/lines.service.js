const pool = require("../../../config/db");

exports.getLineRefsService = async () => {
  return await pool.query(
    "SELECT id, line_reference as line_ref, spec_code as spec, insulation, calc_notes, unit, fluid, seq, diameter, refno as line_refno, gasket FROM `lines`"
  );
};

exports.getLineRefsAllService = async () => {
  return await pool.query("SELECT * FROM `lines`");
};

exports.updateLine = async (line, id) => {
  await pool.query(
    "UPDATE `lines` SET refno = ?, line_reference = ?, unit = ?, fluid = ?, seq = ?, spec_code = ?, pid = ?, stress_level = ?, calc_notes = ?, insulation = ?, diameter = ?, gasket = ? WHERE id = ?",
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
      line.gasket,
      id,
    ]
  );
};

exports.addLine = async (line) => {
  await pool.query(
    "INSERT INTO `lines` (refno, line_reference, unit, fluid, seq, spec_code, pid, stress_level, calc_notes, insulation, diameter, gasket) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
      line.gasket,
    ]
  );
};
