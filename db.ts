import dotenv from "dotenv";
import type { PoolClient } from "pg";
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

// Runs `work` as one transaction on ONE dedicated connection.
//
// Do not use pool.query("BEGIN") / pool.query("COMMIT") for this: every
// pool.query can be handed a different connection from the pool, so BEGIN,
// the statements and COMMIT/ROLLBACK can each run on different connections.
// The statements then are not atomic, and a connection can be left behind
// mid-transaction, silently swallowing later unrelated writes.
export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client: PoolClient = await pool.connect();
  let brokenConnection: Error | undefined;
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      // The connection itself is broken: discard it instead of reusing it.
      brokenConnection = rollbackError as Error;
    }
    throw error;
  } finally {
    client.release(brokenConnection);
  }
}