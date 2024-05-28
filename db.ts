import dotenv from "dotenv";
const { Pool } = require('pg');

dotenv.config();
const {DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE} = process.env;

const pool = new Pool({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT, // default Postgres port
  database: DB_DATABASE,
  ssl: {
    rejectUnauthorized: false // Disable SSL verification
  }
});

export default pool;