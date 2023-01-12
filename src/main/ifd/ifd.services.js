const pool = require("../../../config/db");
const { fillType } = require("../../helpers/pipes");

exports.deletePipe = async (id) => {
  const [pipes] = await pool.query(
    "DELETE FROM estimated_pipes WHERE id = ?",
    id
  );
  return pipes;
};

exports.getPipesService = async () => {
  const [resRows] = await pool.query(
    "SELECT `ep`.`id`,`ep`.`line_ref_id`,`ep`.`tag`,`ep`.`feed_id`,`ep`.`diameter`,`ep`.`train`,`ep`.`area_id`,`l`.`unit`,`l`.`fluid`,`l`.`seq`,`l`.`spec_code` AS `spec`,`l`.`insulation`,`l`.`tag` AS `line_reference`,`a`.`name` AS `area`,`o`.`owner_id`,`u`.`name`as `owner` FROM(`estimated_pipes` as `ep`JOIN `lines` as `l` ON (`ep`.`line_ref_id` = `l`.`id`)JOIN `areas` as `a` ON (`ep`.`area_id` = `a`.`id`)LEFT JOIN `owners` as `o` ON (`o`.`tag` = `ep`.`tag`)LEFT JOIN `users` as `u` ON (`o`.`owner_id` = `u`.`id`)) ORDER BY id DESC"
  );
  const rows = fillType(resRows);
  console.log(rows);
  return rows;
};
