// middleware/auth.js
const passport = require('passport');

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized. Please log in.' });
}

module.exports = { isAuthenticated };
