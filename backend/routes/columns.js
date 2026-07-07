// routes/columns.js
// A "column" is a stage in the workflow, e.g. "To do" / "In progress" / "Done".
// Columns belong to a board, and we always check that the board belongs
// to the logged-in user before letting them touch it - otherwise one
// user could edit another user's data just by guessing an id.

const express = require("express");
const db = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function boardBelongsToUser(boardId, userId) {
  return db
    .prepare("SELECT id FROM boards WHERE id = ? AND user_id = ?")
    .get(boardId, userId);
}

// POST /api/boards/:boardId/columns - add a new column to a board
router.post("/boards/:boardId/columns", (req, res) => {
  const { name } = req.body;
  const { boardId } = req.params;

  if (!boardBelongsToUser(boardId, req.userId)) {
    return res.status(404).json({ error: "Board not found." });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Column name is required." });
  }

  const maxPos = db
    .prepare("SELECT MAX(position) as maxPos FROM columns WHERE board_id = ?")
    .get(boardId);
  const nextPosition = (maxPos.maxPos ?? -1) + 1;

  const result = db
    .prepare("INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)")
    .run(boardId, name.trim(), nextPosition);

  const column = db.prepare("SELECT * FROM columns WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ ...column, tasks: [] });
});

// PATCH /api/columns/:id - rename a column
router.patch("/columns/:id", (req, res) => {
  const column = db.prepare("SELECT * FROM columns WHERE id = ?").get(req.params.id);
  if (!column || !boardBelongsToUser(column.board_id, req.userId)) {
    return res.status(404).json({ error: "Column not found." });
  }

  const { name } = req.body;
  if (name && name.trim()) {
    db.prepare("UPDATE columns SET name = ? WHERE id = ?").run(name.trim(), column.id);
  }

  const updated = db.prepare("SELECT * FROM columns WHERE id = ?").get(column.id);
  res.json(updated);
});

// DELETE /api/columns/:id
router.delete("/columns/:id", (req, res) => {
  const column = db.prepare("SELECT * FROM columns WHERE id = ?").get(req.params.id);
  if (!column || !boardBelongsToUser(column.board_id, req.userId)) {
    return res.status(404).json({ error: "Column not found." });
  }

  db.prepare("DELETE FROM columns WHERE id = ?").run(column.id);
  res.status(204).end();
});

module.exports = router;
