const pool = require("../../../config/db");
const { withTransaction } = require("../../helpers/withTransaction");

exports.getLineRefsService = async (tableName) => {
  const [lines] = await pool.query(
    "SELECT line_reference as line_ref, spec_code as spec, insulation, calc_notes FROM `lines`"
  );
  if (!lines[0]) return 0;
  return lines;
  // return lines.map((x) => x.line_ref);
};
