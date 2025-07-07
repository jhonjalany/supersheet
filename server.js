require('dotenv').config();
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const { createClient } = require('ioredis');
const request = require('request-promise-native');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse Upstash Redis URL
const redisUrl = 'rediss://default:AdofAAIjcDE5NjdiNzIzNjhlNTk0MTZmYCM2ZGQ5NjFmYjA4MzEyYXAxMA@inviting-leech-55839.upstash.io:6379';

// Create Redis client
const redisClient = createClient({ host: redisUrl });

// Optional: Log Redis connection errors
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Session store setup with Redis
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 60 * 1000 } // 30 minutes
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to allow only one login
async function singleUserOnly(req, res, next) {
  const currentSessionId = req.sessionID;

  try {
    const activeSession = await redisClient.get('activeSession');

    if (activeSession && activeSession !== currentSessionId) {
      return res.status(403).send("Another user is already logged in.");
    }

    // Set this session as active if none is set
    if (!activeSession) {
      await redisClient.set('activeSession', currentSessionId);
    }

    next();
  } catch (err) {
    console.error('Error checking active session:', err);
    res.status(500).send('Internal Server Error');
  }
}

// Middleware to check authentication
function ensureAuthenticated(req, res, next) {
  if (req.session.email) {
    req.session.lastActive = Date.now();
    return next();
  }
  res.redirect('/');
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
  const sessionId = req.sessionID;

  req.session.destroy(async (err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }

    // Clear active session from Redis
    await redisClient.del('activeSession');

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
    req.session.destroy(async (err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }

      await redisClient.del('activeSession');
      return res.json({ active: false });
    });
  } else {
    req.session.lastActive = now;
    res.json({ active: true });
  }
});

// Protected dashboard route
app.get('/dashboard.html', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Login app running on http://localhost:${PORT}`);
});
