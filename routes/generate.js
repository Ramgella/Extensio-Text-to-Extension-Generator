const express = require('express');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
// API
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' },

      messages: [
        {
          role: 'system',
          content: `
You are a professional Chrome Extension developer.

Generate a COMPLETE and WORKING Chrome Extension using Manifest V3.

Return ONLY valid JSON.

Required JSON format:
{
  "manifest.json": "...",
  "content.js": "...",
  "popup.html": "..."
}

STRICT RULES:

1. manifest.json MUST be valid JSON
2. Use ONLY Manifest Version 3
3. Include:
   - manifest_version
   - name
   - version
   - permissions
   - host_permissions
   - action
   - content_scripts

4. content.js MUST actually modify the webpage
5. popup.html MUST be valid HTML
6. Escape all quotes properly
7. No markdown
8. No explanations
9. Return ONLY parsable JSON

Example manifest:
{
  "manifest_version": 3,
  "name": "Test Extension",
  "version": "1.0",
  "permissions": ["activeTab", "scripting"],
  "host_permissions": ["<all_urls>"],
  "action": {
    "default_popup": "popup.html"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}
`
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });
     // console.log('Raw response:', completion.choices[0].message.content);a
     // console.log('Parsed files:', files);aaeww
    const files = JSON.parse(
      completion.choices[0].message.content
    );

    const buildId = uuidv4();

    const buildDir = path.join(
      __dirname,
      '../tmp',
      buildId
    );
// Ensure build directory existsa
    fs.mkdirSync(buildDir, { recursive: true });

    for (const [filename, content] of Object.entries(files)) {
      fs.writeFileSync(
        path.join(buildDir, filename),
        content
      );
    }
// Create zip archivesa
    const zipPath = path.join(
      __dirname,
      '../tmp',
      `${buildId}.zip`
    );

    const output = fs.createWriteStream(zipPath);
// Create zip archivea
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.pipe(output);

    archive.directory(buildDir, false);

    await archive.finalize();

    const sizeKb = Math.round(
      fs.statSync(zipPath).size / 1024
    );
// Clean up build directoryaaa
    res.json({
      success: true,

      buildId,

      extensionName: 'AI Generated Extension',
      version: '1.0',
      fileCount: Object.keys(files).length,
      sizeKb,

      code: {
        manifest: files['manifest.json'] || '',
        contentJs: files['content.js'] || '',
        popupHtml: files['popup.html'] || ''
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;