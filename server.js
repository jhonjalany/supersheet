require('dotenv').config();
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const { createClient } = require('redis');
const request = require('request-promise-native');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redis client setup
const redisClient = createClient({
  url: process.env.UPSTASH_REDIS_URL,
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.connect().then(() => {
  console.log('Connected to Redis via Upstash');
});

// Session setup with Redis
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 60 * 1000 } // 30 mins
}));

// Middleware to allow only one login per user
async function singleUserOnly(req, res, next) {
  const currentSessionId = req.sessionID;
  const activeSessionId = await redisClient.get('activeSession');

  if (activeSessionId && activeSessionId !== currentSessionId) {
    return res.status(403).send("Another user is already logged in.");
  }

  // Set current session as active
  await redisClient.set('activeSession', currentSessionId);
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
      req.session.email = email;
      req.session.lastActive = Date.now();
      res.json({ redirect: "https://supersheet.pages.dev/" }); // Change to your hosted site
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Logout route
app.get('/logout', async (req, res) => {
  const sessionId = req.sessionID;

  req.session.destroy(async (err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    await redisClient.del('activeSession');
    res.redirect('/');
  });
});

// Activity tracker
app.get('/ping', async (req, res) => {
  if (!req.session.email) {
    return res.json({ active: false });
  }

  const now = Date.now();
  const lastActive = req.session.lastActive || now;
  const inactiveTime = (now - lastActive) / 60000; // in minutes

  if (inactiveTime > 30) {
    req.session.destroy(async (err) => {
      if (err) console.error("Session destroy error:", err);
      await redisClient.del('activeSession');
      return res.json({ active: false });
    });
  } else {
    req.session.lastActive = now;
    await req.session.save(); // Ensure session changes are saved
    res.json({ active: true });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Login app running on http://localhost:${PORT}`);
});
