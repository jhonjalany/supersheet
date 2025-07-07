require('dotenv').config();
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session); // Redis session store
const request = require('request-promise-native');
const path = require('path');
const redis = require('redis');

const { setSession, getSession, clearSession } = require('./sessions');

const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create Redis client
const redisClient = redis.createClient({
  url: "rediss://default:AdofAAIjcDE5NjdiNzIzNjhlNTk0MTZmYWM2ZGQ5NjFmYjA4MzEyYXAxMA@inviting-leech-55839.upstash.io:6379",
});

redisClient.on('error', function (err) {
  console.error('Redis error:', err);
});

// Session setup with Redis
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 60 * 1000 } // 30 mins
}));

// Track login
let loggedInUser = null;

// Middleware to allow only one login
function singleUserOnly(req, res, next) {
  const currentSession = req.sessionID;
  const activeSession = getSession();

  if (activeSession && activeSession !== currentSession) {
    return res.status(403).send("Another user is already logged in.");
  }

  next();
}

// Login route
app.post('/login', singleUserOnly, async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await request.post({
      uri: process.env.N8N_WEBHOOK_URL,
      json: true,
      body: { email, password }
    });

    if (response && response.success === true) {
      setSession(req.sessionID);
      loggedInUser = email;
      req.session.email = email;
      req.session.lastActive = Date.now();
      res.json({ redirect: "/dashboard.html" });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    clearSession();
    res.redirect('/');
  });
});

// Activity tracker
app.get('/ping', (req, res) => {
  if (!req.session.email) {
    return res.json({ active: false });
  }

  const now = Date.now();
  const inactiveTime = (now - req.session.lastActive) / 60000; // in minutes

  if (inactiveTime > 30) {
    req.session.destroy(() => {
      clearSession();
      return res.json({ active: false });
    });
  } else {
    req.session.lastActive = now;
    res.json({ active: true });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Login app running on http://localhost:${PORT}`);
});
