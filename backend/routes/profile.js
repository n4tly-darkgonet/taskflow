// routes/profile.js
// Handles reading and updating the logged-in user's own profile info:
// display name, email, and their join date.

const express = require("express");
const { pool } = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/profile - the logged-in user's own profile
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT username, display_name, email, created_at FROM users WHERE id = $1",
      [req.userId]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/profile - update display name and/or email
router.patch("/", async (req, res, next) => {
  try {
    const { display_name, email } = req.body;

    // Basic sanity check on email format if one was provided - not
    // exhaustive, just catches obvious typos like a missing "@".
    if (email && email.trim() && !email.includes("@")) {
      return res.status(400).json({ error: "That doesn't look like a valid email address." });
    }

    await pool.query(
      "UPDATE users SET display_name = COALESCE($1, display_name), email = $2 WHERE id = $3",
      [display_name?.trim() || null, email?.trim() || null, req.userId]
    );

    const result = await pool.query(
      "SELECT username, display_name, email, created_at FROM users WHERE id = $1",
      [req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;