// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

// ✅ Your secret password
const SECRET_PASSWORD = 'myStrongPassword'; // Or load from .env

// ✅ Serve secret.json only with the correct password
app.get('/secret.json', (req, res) => {
  const auth = req.headers['authorization'];

  if (!auth || auth !== `Bearer ${SECRET_PASSWORD}`) {
    // 🔒 Return fake 404 if the password is missing or wrong
    return res.status(404).send('Not found');
  }

  // ✅ If authorized, serve the JSON file securely
  res.sendFile(path.join(__dirname, 'server', 'secret.json'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Secure server running at http://localhost:${PORT}`);
});
