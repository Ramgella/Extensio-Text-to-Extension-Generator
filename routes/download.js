const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
// project

router.get('/download/:buildId', (req, res) => {
  const { buildId } = req.params;

  // Sanitize buildId — must be a UUID (alphanumeric + hyphens only)
  if (!/^[a-f0-9-]{36}$/.test(buildId)) {
    return res.status(400).json({ error: 'Invalid build ID.' });
  }

  const zipPath = path.join(__dirname, '..', 'tmp', `${buildId}.zip`);

  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({ error: 'Build not found. It may have expired.' });
  }

  res.download(zipPath, 'extension.zip', (err) => {
    if (err) {
      console.error('Download error:', err);
    }
    // Clean up zip after download
    // Clean up zip after download
    try { fs.unlinkSync(zipPath); } catch (_) {}
  });
});

module.exports = router;
