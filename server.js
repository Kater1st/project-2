const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');
const { connectDB } = require('./database');

// --- Auth packages ---
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');

// Middleware
const { isAuthenticated } = require('./middleware/auth'); // NEW middleware import

// Routes
const booksRoute = require('./routes/books');
const authorsRoute = require('./routes/authors');

const app = express();

// -----------------------------
// Session & Passport Setup
// -----------------------------
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:8080/auth/github/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

// -----------------------------
// Auth Routes
// -----------------------------

// Login with GitHub
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// GitHub callback
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // successful login
  }
);

// Logout
app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// NEW: Get current logged-in user info
app.get('/auth/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

// -----------------------------
// Middleware
// -----------------------------
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// -----------------------------
// API Routes
// -----------------------------
// Note: books.js and authors.js already check authentication for POST, PUT, DELETE
app.use('/books', booksRoute);
app.use('/authors', authorsRoute);

// -----------------------------
// Home Route
// -----------------------------
app.get('/', (req, res) => {
  res.send('Welcome to Project 2 API');
});

// -----------------------------
// Start Server
// -----------------------------
const PORT = process.env.PORT || 8080;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect to database', err);
    process.exit(1);
  });
