const { createPool } = require("mysql2/promise");
require("dotenv").config();

const pool = createPool({
  host: process.env.NODE_DB_HOST,
  user: process.env.NODE_DB_USERNAME,
  password: process.env.NODE_DB_PASSWORD,
  database: process.env.NODE_DB_DATABASE,
});

module.exports = pool;
