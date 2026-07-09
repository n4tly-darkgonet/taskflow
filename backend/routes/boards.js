// routes/boards.js
// A "board" is the top-level object, e.g. "Website redesign" or "Q3 goals".
// Every board belongs to exactly one user.

const express = require("express");
const { pool, withTransaction } = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// Every route in this file requires the user to be logged in.
router.use(requireAuth);

// GET /api/boards - list all boards belonging to the logged-in user
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM boards WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/boards - create a new board (and 3 default columns)
router.post("/", async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Board name is required." });
    }

    // Run both inserts as a single transaction so we never end up with
    // a board that has no columns (e.g. if the server crashed mid-way).
    const board = await withTransaction(async (client) => {
      const boardResult = await client.query(
        "INSERT INTO boards (user_id, name) VALUES ($1, $2) RETURNING *",
        [req.userId, name.trim()]
      );
      const newBoard = boardResult.rows[0];

      const defaultColumns = ["To do", "In progress", "Done"];
      for (let i = 0; i < defaultColumns.length; i++) {
        await client.query(
          "INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3)",
          [newBoard.id, defaultColumns[i], i]
        );
      }

      return newBoard;
    });

    res.status(201).json(board);
  } catch (err) {
    next(err);
  }
});

// GET /api/boards/:id - get one board with its columns and tasks
router.get("/:id", async (req, res, next) => {
  try {
    const boardResult = await pool.query(
      "SELECT * FROM boards WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    const board = boardResult.rows[0];
    if (!board) {
      return res.status(404).json({ error: "Board not found." });
    }

    const columnsResult = await pool.query(
      "SELECT * FROM columns WHERE board_id = $1 ORDER BY position",
      [board.id]
    );

    const columnsWithTasks = await Promise.all(
      columnsResult.rows.map(async (col) => {
        const tasksResult = await pool.query(
          "SELECT * FROM tasks WHERE column_id = $1 ORDER BY position",
          [col.id]
        );
        return { ...col, tasks: tasksResult.rows };
      })
    );

    res.json({ ...board, columns: columnsWithTasks });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/boards/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const boardResult = await pool.query(
      "SELECT * FROM boards WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    const board = boardResult.rows[0];
    if (!board) {
      return res.status(404).json({ error: "Board not found." });
    }

    // Thanks to "ON DELETE CASCADE" in our schema, deleting a board
    // automatically deletes its columns and tasks too.
    await pool.query("DELETE FROM boards WHERE id = $1", [board.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;