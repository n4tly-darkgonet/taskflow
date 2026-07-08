// routes/tasks.js
// A "task" is a single card on the board, e.g. "Design the login page".
// Tasks live inside a column, and their "position" controls the order
// they're displayed in within that column (0 = top).

const express = require("express");
const db = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// Helper: walk from a task/column up to its board, and confirm that
// board belongs to the logged-in user. Prevents user A from editing
// user B's tasks just by guessing an id.
function columnBelongsToUser(columnId, userId) {
  return db
    .prepare(
      `SELECT columns.* FROM columns
       JOIN boards ON boards.id = columns.board_id
       WHERE columns.id = ? AND boards.user_id = ?`
    )
    .get(columnId, userId);
}

// POST /api/columns/:columnId/tasks - add a task to the end of a column
router.post("/columns/:columnId/tasks", (req, res) => {
  const { columnId } = req.params;
  const { title, description, due_date } = req.body;

  if (!columnBelongsToUser(columnId, req.userId)) {
    return res.status(404).json({ error: "Column not found." });
  }
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Task title is required." });
  }

  const maxPos = db
    .prepare("SELECT MAX(position) as maxPos FROM tasks WHERE column_id = ?")
    .get(columnId);
  const nextPosition = (maxPos.maxPos ?? -1) + 1;

  const result = db
    .prepare(
      "INSERT INTO tasks (column_id, title, description, due_date, position) VALUES (?, ?, ?, ?, ?)"
    )
    .run(columnId, title.trim(), description || "", due_date || null, nextPosition);

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(task);
});

// PATCH /api/tasks/:id - edit a task's title/description
router.patch("/tasks/:id", (req, res) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  if (!task || !columnBelongsToUser(task.column_id, req.userId)) {
    return res.status(404).json({ error: "Task not found." });
  }

  const { title, description, due_date } = req.body;
  db.prepare(
    "UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description), due_date = COALESCE(?, due_date) WHERE id = ?"
  ).run(title?.trim(), description, due_date, task.id);

  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(task.id);
  res.json(updated);
});

// DELETE /api/tasks/:id
router.delete("/tasks/:id", (req, res) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  if (!task || !columnBelongsToUser(task.column_id, req.userId)) {
    return res.status(404).json({ error: "Task not found." });
  }

  db.prepare("DELETE FROM tasks WHERE id = ?").run(task.id);
  res.status(204).end();
});

// POST /api/tasks/move - move a task to a new column and/or position
// This is what powers drag-and-drop. The frontend tells us: which
// task moved, which column it ended up in, and what index (0-based)
// it should sit at within that column.
router.post("/tasks/move", (req, res) => {
  const { taskId, toColumnId, toIndex } = req.body;

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);
  if (!task || !columnBelongsToUser(task.column_id, req.userId)) {
    return res.status(404).json({ error: "Task not found." });
  }
  if (!columnBelongsToUser(toColumnId, req.userId)) {
    return res.status(404).json({ error: "Destination column not found." });
  }

  const moveTask = db.transaction(() => {
    const fromColumnId = task.column_id;

    // Pull every other task currently in the destination column,
    // in order, so we can splice this task into the right spot.
    const destTasks = db
      .prepare("SELECT * FROM tasks WHERE column_id = ? AND id != ? ORDER BY position")
      .all(toColumnId, taskId);

    destTasks.splice(toIndex, 0, task);

    // Re-number every task in the destination column from scratch.
    const updateStmt = db.prepare(
      "UPDATE tasks SET column_id = ?, position = ? WHERE id = ?"
    );
    destTasks.forEach((t, index) => {
      updateStmt.run(toColumnId, index, t.id);
    });

    // If the task moved OUT of a different column, re-number the
    // tasks left behind in the old column so there are no gaps.
    if (fromColumnId !== Number(toColumnId)) {
      const remaining = db
        .prepare("SELECT * FROM tasks WHERE column_id = ? ORDER BY position")
        .all(fromColumnId);
      const reindexStmt = db.prepare("UPDATE tasks SET position = ? WHERE id = ?");
      remaining.forEach((t, index) => reindexStmt.run(index, t.id));
    }
  });

  moveTask();

  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);
  res.json(updated);
});

module.exports = router;