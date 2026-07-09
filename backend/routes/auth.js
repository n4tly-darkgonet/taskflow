// routes/auth.js
// Handles account creation and login.

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existing = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "That username is already taken." });
    }

    // Never store plain-text passwords - always hash them.
    const passwordHash = bcrypt.hashSync(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id",
      [username, passwordHash]
    );

    const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ token, username });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Incorrect username or password." });
    }

    const passwordMatches = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Incorrect username or password." });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, username: user.username });
  } catch (err) {
    next(err);
  }
});

module.exports = router;