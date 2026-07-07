// db.js
// This file sets up our database connection and creates the tables
// we need (if they don't already exist). We're using SQLite because
// it needs zero setup - it's just a file on disk - but it's still a
// real relational database with real SQL, the same skills transfer
// directly to Postgres or MySQL later.

// Node's own built-in SQLite (available since Node 22, no extra install
// or C++ compiler needed - unlike the "better-sqlite3" npm package).
const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "taskflow.db");
const db = new DatabaseSync(dbPath);

// Enforce foreign key constraints (off by default in SQLite)
db.exec("PRAGMA foreign_keys = ON");

// node:sqlite doesn't ship a .transaction() helper the way better-sqlite3
// does, so we add a small one ourselves with the same shape: call
// db.transaction(fn) to get back a function - calling THAT function runs
// fn() wrapped in BEGIN/COMMIT, and rolls back automatically if fn throws.
db.transaction = function (fn) {
  return function (...args) {
    db.exec("BEGIN");
    try {
      const result = fn(...args);
      db.exec("COMMIT");
      return result;
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  };
};

// Create tables if they don't exist yet.
// exec() lets us run multiple SQL statements at once.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    column_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    position INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
  );
`);

module.exports = db;
