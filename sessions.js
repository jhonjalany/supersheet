// sessions.js
const redisClient = require('redis').createClient({
  url: "rediss://default:AdofAAIjcDE5NjdiNzIzNjhlNTk0MTZmYWM2ZGQ5NjFmYjA4MzEyYXAxMA@inviting-leech-55839.upstash.io:6379",
});

redisClient.on('error', function (err) {
  console.error('Redis error in sessions.js:', err);
});

const ACTIVE_SESSION_KEY = 'activeSessionID';

async function setSession(sessionID) {
  try {
    await redisClient.set(ACTIVE_SESSION_KEY, sessionID);
  } catch (err) {
    console.error('Failed to save session to Redis:', err);
  }
}

async function getSession() {
  try {
    const sessionID = await redisClient.get(ACTIVE_SESSION_KEY);
    return sessionID;
  } catch (err) {
    console.error('Failed to get session from Redis:', err);
    return null;
  }
}

async function clearSession() {
  try {
    await redisClient.del(ACTIVE_SESSION_KEY);
  } catch (err) {
    console.error('Failed to delete session from Redis:', err);
  }
}

module.exports = { setSession, getSession, clearSession };
