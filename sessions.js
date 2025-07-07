// sessions.js
let activeSession = null;

function setSession(sessionID) {
  activeSession = sessionID;
}

function getSession() {
  return activeSession;
}

function clearSession() {
  activeSession = null;
}

module.exports = { setSession, getSession, clearSession };
