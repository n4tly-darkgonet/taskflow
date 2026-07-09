// db.js
// Now backed by Postgres (hosted on Neon) instead of a local SQLite file.
// Why the switch: SQLite was a file on YOUR computer's disk. That's great
// for developing locally, but most free hosting providers wipe their disk
// on every restart/redeploy - so a real deployed app needs a database that
// lives somewhere permanent. Neon gives us that for free.
//
// We use the same DATABASE_URL both locally and when deployed, so your
// laptop and your live site share one database. (In a bigger company
// you'd usually have a separate database per environment - we're keeping
// it simple with one, which is completely fine for a personal project.)

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL in your .env file. See .env.example.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
});

// Postgres doesn't have a built-in .transaction() helper like some
// SQLite libraries do, so we write our own small one. It hands you a
// "client" to run queries with - if your function throws, everything
// gets rolled back; if it succeeds, everything gets committed together.
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Creates all our tables if they don't already exist. Safe to run every
// time the server starts - it won't touch tables that already exist.
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS boards (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS columns (
      id SERIAL PRIMARY KEY,
      board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      position INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      column_id INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      due_date TEXT DEFAULT NULL,
      position INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

module.exports = { pool, withTransaction, init };