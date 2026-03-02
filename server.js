require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
// server
// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure tmp directory exists and clean it on startup
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

// Routes
app.use('/api', require('./routes/generate'));
app.use('/api', require('./routes/download'));
app.use('/api', require('./routes/projects'));

// Serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════╗');
  console.log('  ║        Extensio.ai  🧩             ║');
  console.log('  ║  No-Code Extension Factory         ║');
  console.log(`  ║  Running → http://localhost:${PORT}   ║`);
  console.log('  ╚═══════════════════════════════════╝');
  console.log('');
});
