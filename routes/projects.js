const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory project store (persists while server is running)
// For production, replace with a database
const projects = new Map();
// project
// Save a project
router.post('/projects', (req, res) => {
  const { extensionName, description, version, prompt, code, files, sizeKb } = req.body;

  if (!extensionName || !prompt) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const id = uuidv4();
  const now = new Date().toISOString();
// Extract extension name from manifest if possible
  // Check if a project with this name exists (for versioning)
  let existingId = null;
  let versionNumber = 1;
  for (const [pid, proj] of projects.entries()) {
    if (proj.extensionName === extensionName) {
      existingId = pid;
      versionNumber = proj.versions.length + 1;
      break;
    }
  }

  if (existingId) {
    // Add new version to existing project // update timestamp
    const proj = projects.get(existingId);
    proj.versions.push({
      versionNumber,
      prompt,
      code,
      createdAt: now,
      sizeKb
    });
    proj.currentVersion = versionNumber;
    proj.updatedAt = now;
    return res.json({ success: true, id: existingId, versionNumber, message: `Saved as v${versionNumber}` });
  }

  // Create new project
  const project = {
    id,
    extensionName,
    description,
    version,
    createdAt: now,
    updatedAt: now,
    currentVersion: 1,
    files,
    versions: [{
      versionNumber: 1,
      prompt,
      code,
      createdAt: now,
      sizeKb
    }]
  };

  projects.set(id, project);
  res.json({ success: true, id, versionNumber: 1, message: 'Saved as v1' });
});

// Get all projects
router.get('/projects', (req, res) => {
  const list = Array.from(projects.values()).map(p => ({
    id: p.id,
    extensionName: p.extensionName,
    description: p.description,
    currentVersion: p.currentVersion,
    versionCount: p.versions.length,
    files: p.files,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  }));

  // Sort by most recently updated
  list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(list);
});

// Get single project with all versions
router.get('/projects/:id', (req, res) => {
  const proj = projects.get(req.params.id);
  if (!proj) return res.status(404).json({ error: 'Project not found.' });
  res.json(proj);
});

// Delete project
router.delete('/projects/:id', (req, res) => {
  if (!projects.has(req.params.id)) return res.status(404).json({ error: 'Project not found.' });
  projects.delete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
