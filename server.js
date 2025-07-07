// server.js
require('dotenv').config();
const express = require('express');
const request = require('request-promise-native');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory login state
let loggedInUser = null;
let lastActiveTime = null;

// Middleware to allow only one login
function singleUserOnly(req, res, next) {
  if (loggedInUser !== null) {
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
      loggedInUser = email;
      lastActiveTime = Date.now();
      res.json({ redirect: "/dashboard.html" }); // Change to your hosted site
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
  loggedInUser = null;
  res.redirect('/');
});

// Activity tracker
app.get('/ping', (req, res) => {
  if (!loggedInUser) {
    return res.json({ active: false });
  }

  const now = Date.now();
  const inactiveTime = (now - lastActiveTime) / 60000; // in minutes

  if (inactiveTime > 30) {
    loggedInUser = null;
    return res.json({ active: false });
  } else {
    lastActiveTime = now;
    res.json({ active: true, user: loggedInUser });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Login app running on http://localhost:${PORT}`);
});
