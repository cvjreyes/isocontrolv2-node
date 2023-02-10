const pool = require("../../../config/db");

exports.getLineRefsService = async () => {
  const [lines] = await pool.query(
    "SELECT line_reference as line_ref, spec_code as spec, insulation, calc_notes, unit, fluid, seq, diameter, refno as line_refno FROM `lines`"
  );
  if (!lines[0]) return 0;
  return lines;
};
