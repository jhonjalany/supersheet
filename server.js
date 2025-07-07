require('dotenv').config();
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const Redis = require('ioredis'); // Correct import for ioredis
const request = require('request-promise-native');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Full Redis URL from Upstash
const redisUrl = 'rediss://default:AdofAAIjcDE5NjdiNzIzNjhlNTk0MTZmYWM2ZGQ5NjFmYjA4MzEyYXAxMA@inviting-leech-55839.upstash.io:6379';

// Create Redis client
const redisClient = new Redis(redisUrl);

redisClient.on('error', (err) => {
  console.error('Redis error:', err.message);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
  // Clear previous active session and stale user logins on server start
  redisClient.del('activeSession').then(() => {
    console.log('Cleared previous active session.');
  });
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

// Middleware to allow only one login per user at a time
async function singleUserOnly(req, res, next) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    // Check if this user is already logged in
    const existingSession = await redisClient.get(`loggedInUser:${email}`);

    if (existingSession) {
      return res.status(403).json({ error: "This account is already logged in on another device." });
    }

    next();
  } catch (err) {
    console.error('Error checking user session:', err);
    res.status(500).send('Internal Server Error');
  }
}

// Middleware to check authentication
function ensureAuthenticated(req, res, next) {
  if (req.session.email) {
    req.session.lastActive = Date.now();
    return next();
  }

  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(401).json({ active: false });
  }

  res.redirect('/');
}

// Login route
app.post('/login', singleUserOnly, async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await request.post({
      uri: process.env.N8N_WEBHOOK_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      json: true,
      body: { email, password }
    });

    if (response && response.success === true) {
      req.session.email = email;
      req.session.lastActive = Date.now();

      // Mark this user as logged in
      await redisClient.set(`loggedInUser:${email}`, req.sessionID);

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
  const { email } = req.session;

  req.session.destroy(async (err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }

    if (email) {
      await redisClient.del(`loggedInUser:${email}`);
    }

    await redisClient.del('activeSession');

    res.redirect('/');
  });
});

// Activity tracker
app.get('/ping', ensureAuthenticated, (req, res) => {
  const now = Date.now();
  const inactiveTime = (now - req.session.lastActive) / 60000; // in minutes

  if (inactiveTime > 30) {
    const { email } = req.session;

    req.session.destroy(async (err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }

      if (email) {
        await redisClient.del(`loggedInUser:${email}`);
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
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Optional: Periodically clean up stale sessions
setInterval(async () => {
  const allKeys = await redisClient.keys('loggedInUser:*');
  for (const key of allKeys) {
    const sessionId = await redisClient.get(key);
    const sessionData = await redisClient.get(`session:${sessionId}`);

    if (!sessionData) {
      await redisClient.del(key); // Remove stale user login
    }
  }
}, 60 * 60 * 1000); // Run every hour

// Start server
app.listen(PORT, () => {
  console.log(`Login app running on http://localhost:${PORT}`);
});
