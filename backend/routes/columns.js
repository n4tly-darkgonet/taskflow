// routes/columns.js
// A "column" is a stage in the workflow, e.g. "To do" / "In progress" / "Done".
// Columns belong to a board, and we always check that the board belongs
// to the logged-in user before letting them touch it - otherwise one
// user could edit another user's data just by guessing an id.

const express = require("express");
const { pool } = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

async function boardBelongsToUser(boardId, userId) {
  const result = await pool.query(
    "SELECT id FROM boards WHERE id = $1 AND user_id = $2",
    [boardId, userId]
  );
  return result.rows[0];
}

// POST /api/boards/:boardId/columns - add a new column to a board
router.post("/boards/:boardId/columns", async (req, res, next) => {
  try {
    const { name } = req.body;
    const { boardId } = req.params;

    if (!(await boardBelongsToUser(boardId, req.userId))) {
      return res.status(404).json({ error: "Board not found." });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Column name is required." });
    }

    const maxPosResult = await pool.query(
      "SELECT MAX(position) as max_pos FROM columns WHERE board_id = $1",
      [boardId]
    );
    const nextPosition = (maxPosResult.rows[0].max_pos ?? -1) + 1;

    const result = await pool.query(
      "INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3) RETURNING *",
      [boardId, name.trim(), nextPosition]
    );

    res.status(201).json({ ...result.rows[0], tasks: [] });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/columns/:id - rename a column
router.patch("/columns/:id", async (req, res, next) => {
  try {
    const columnResult = await pool.query("SELECT * FROM columns WHERE id = $1", [req.params.id]);
    const column = columnResult.rows[0];
    if (!column || !(await boardBelongsToUser(column.board_id, req.userId))) {
      return res.status(404).json({ error: "Column not found." });
    }

    const { name } = req.body;
    if (name && name.trim()) {
      await pool.query("UPDATE columns SET name = $1 WHERE id = $2", [name.trim(), column.id]);
    }

    const updated = await pool.query("SELECT * FROM columns WHERE id = $1", [column.id]);
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/columns/:id
router.delete("/columns/:id", async (req, res, next) => {
  try {
    const columnResult = await pool.query("SELECT * FROM columns WHERE id = $1", [req.params.id]);
    const column = columnResult.rows[0];
    if (!column || !(await boardBelongsToUser(column.board_id, req.userId))) {
      return res.status(404).json({ error: "Column not found." });
    }

    await pool.query("DELETE FROM columns WHERE id = $1", [column.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;