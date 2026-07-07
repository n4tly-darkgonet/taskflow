// routes/boards.js
// A "board" is the top-level object, e.g. "Website redesign" or "Q3 goals".
// Every board belongs to exactly one user.

const express = require("express");
const db = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// Every route in this file requires the user to be logged in.
router.use(requireAuth);

// GET /api/boards - list all boards belonging to the logged-in user
router.get("/", (req, res) => {
  const boards = db
    .prepare("SELECT * FROM boards WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.userId);
  res.json(boards);
});

// POST /api/boards - create a new board (and 3 default columns)
router.post("/", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Board name is required." });
  }

  const insertBoard = db.prepare(
    "INSERT INTO boards (user_id, name) VALUES (?, ?)"
  );
  const insertColumn = db.prepare(
    "INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)"
  );

  // Run both inserts as a single transaction so we never end up with
  // a board that has no columns (e.g. if the server crashed mid-way).
  const createBoardWithDefaults = db.transaction((boardName) => {
    const result = insertBoard.run(req.userId, boardName);
    const boardId = result.lastInsertRowid;
    ["To do", "In progress", "Done"].forEach((colName, index) => {
      insertColumn.run(boardId, colName, index);
    });
    return boardId;
  });

  const boardId = createBoardWithDefaults(name.trim());
  const board = db.prepare("SELECT * FROM boards WHERE id = ?").get(boardId);
  res.status(201).json(board);
});

// GET /api/boards/:id - get one board with its columns and tasks
router.get("/:id", (req, res) => {
  const board = db
    .prepare("SELECT * FROM boards WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.userId);

  if (!board) {
    return res.status(404).json({ error: "Board not found." });
  }

  const columns = db
    .prepare("SELECT * FROM columns WHERE board_id = ? ORDER BY position")
    .all(board.id);

  const tasksStmt = db.prepare(
    "SELECT * FROM tasks WHERE column_id = ? ORDER BY position"
  );
  const columnsWithTasks = columns.map((col) => ({
    ...col,
    tasks: tasksStmt.all(col.id),
  }));

  res.json({ ...board, columns: columnsWithTasks });
});

// DELETE /api/boards/:id
router.delete("/:id", (req, res) => {
  const board = db
    .prepare("SELECT * FROM boards WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.userId);

  if (!board) {
    return res.status(404).json({ error: "Board not found." });
  }

  // Thanks to "ON DELETE CASCADE" in our schema, deleting a board
  // automatically deletes its columns and tasks too.
  db.prepare("DELETE FROM boards WHERE id = ?").run(board.id);
  res.status(204).end();
});

module.exports = router;
