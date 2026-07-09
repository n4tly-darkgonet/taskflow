// server.js
// This is the entry point of our backend. It starts an Express server,
// wires up middleware (cors, json parsing), and mounts our routes.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const authRoutes = require("./routes/auth");
const boardRoutes = require("./routes/boards");
const columnRoutes = require("./routes/columns");
const taskRoutes = require("./routes/tasks");

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET in your .env file. Copy .env.example to .env and set one.");
  process.exit(1);
}

const app = express();

app.use(cors()); // allows the frontend (running on a different origin) to call this API
app.use(express.json()); // parses incoming JSON request bodies into req.body

// Mount our route files under /api
app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api", columnRoutes); // handles /api/boards/:boardId/columns and /api/columns/:id
app.use("/api", taskRoutes); // handles /api/columns/:columnId/tasks and /api/tasks/:id

// Simple health check - useful for confirming the server is alive
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Catch-all error handler - if any route throws, we end up here
// instead of crashing the whole server.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our end." });
});

const PORT = process.env.PORT || 4000;

// Make sure the database tables exist before we start accepting requests.
db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`TaskFlow API running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err.message);
    process.exit(1);
  });