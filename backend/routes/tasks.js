// routes/tasks.js
// A "task" is a single card on the board, e.g. "Design the login page".
// Tasks live inside a column, and their "position" controls the order
// they're displayed in within that column (0 = top).

const express = require("express");
const { pool, withTransaction } = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// Helper: walk from a task/column up to its board, and confirm that
// board belongs to the logged-in user. Prevents user A from editing
// user B's tasks just by guessing an id.
async function columnBelongsToUser(columnId, userId) {
  const result = await pool.query(
    `SELECT columns.* FROM columns
     JOIN boards ON boards.id = columns.board_id
     WHERE columns.id = $1 AND boards.user_id = $2`,
    [columnId, userId]
  );
  return result.rows[0];
}

// POST /api/columns/:columnId/tasks - add a task to the end of a column
router.post("/columns/:columnId/tasks", async (req, res, next) => {
  try {
    const { columnId } = req.params;
    const { title, description, due_date } = req.body;

    if (!(await columnBelongsToUser(columnId, req.userId))) {
      return res.status(404).json({ error: "Column not found." });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Task title is required." });
    }

    const maxPosResult = await pool.query(
      "SELECT MAX(position) as max_pos FROM tasks WHERE column_id = $1",
      [columnId]
    );
    const nextPosition = (maxPosResult.rows[0].max_pos ?? -1) + 1;

    const result = await pool.query(
      "INSERT INTO tasks (column_id, title, description, due_date, position) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [columnId, title.trim(), description || "", due_date || null, nextPosition]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id - edit a task's title/description/due date
router.patch("/tasks/:id", async (req, res, next) => {
  try {
    const taskResult = await pool.query("SELECT * FROM tasks WHERE id = $1", [req.params.id]);
    const task = taskResult.rows[0];
    if (!task || !(await columnBelongsToUser(task.column_id, req.userId))) {
      return res.status(404).json({ error: "Task not found." });
    }

    const { title, description, due_date } = req.body;
    await pool.query(
      "UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), due_date = COALESCE($3, due_date) WHERE id = $4",
      [title?.trim(), description, due_date, task.id]
    );

    const updated = await pool.query("SELECT * FROM tasks WHERE id = $1", [task.id]);
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id
router.delete("/tasks/:id", async (req, res, next) => {
  try {
    const taskResult = await pool.query("SELECT * FROM tasks WHERE id = $1", [req.params.id]);
    const task = taskResult.rows[0];
    if (!task || !(await columnBelongsToUser(task.column_id, req.userId))) {
      return res.status(404).json({ error: "Task not found." });
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [task.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks/move - move a task to a new column and/or position
// This is what powers drag-and-drop. The frontend tells us: which
// task moved, which column it ended up in, and what index (0-based)
// it should sit at within that column.
router.post("/tasks/move", async (req, res, next) => {
  try {
    const { taskId, toColumnId, toIndex } = req.body;

    const taskResult = await pool.query("SELECT * FROM tasks WHERE id = $1", [taskId]);
    const task = taskResult.rows[0];
    if (!task || !(await columnBelongsToUser(task.column_id, req.userId))) {
      return res.status(404).json({ error: "Task not found." });
    }
    if (!(await columnBelongsToUser(toColumnId, req.userId))) {
      return res.status(404).json({ error: "Destination column not found." });
    }

    await withTransaction(async (client) => {
      const fromColumnId = task.column_id;

      const destResult = await client.query(
        "SELECT * FROM tasks WHERE column_id = $1 AND id != $2 ORDER BY position",
        [toColumnId, taskId]
      );
      const destTasks = destResult.rows;
      destTasks.splice(toIndex, 0, task);

      for (let i = 0; i < destTasks.length; i++) {
        await client.query("UPDATE tasks SET column_id = $1, position = $2 WHERE id = $3", [
          toColumnId,
          i,
          destTasks[i].id,
        ]);
      }

      if (fromColumnId !== Number(toColumnId)) {
        const remainingResult = await client.query(
          "SELECT * FROM tasks WHERE column_id = $1 ORDER BY position",
          [fromColumnId]
        );
        const remaining = remainingResult.rows;
        for (let i = 0; i < remaining.length; i++) {
          await client.query("UPDATE tasks SET position = $1 WHERE id = $2", [i, remaining[i].id]);
        }
      }
    });

    const updated = await pool.query("SELECT * FROM tasks WHERE id = $1", [taskId]);
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;