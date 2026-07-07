// middleware/auth.js
// This runs before any "protected" route. It checks that the request
// has a valid login token (JWT) attached, and if so, figures out
// which user is making the request.

const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization; // expected: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "You need to be logged in to do that." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId; // attach the user's id to the request
    next(); // move on to the actual route handler
  } catch (err) {
    return res.status(401).json({ error: "Your session has expired. Please log in again." });
  }
}

module.exports = requireAuth;
