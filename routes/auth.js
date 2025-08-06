const express = require('express');
const passport = require('passport');

const router = express.Router();

// Login with GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub callback
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.json({ message: 'Login successful', user: req.user });
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user info
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

module.exports = router;
