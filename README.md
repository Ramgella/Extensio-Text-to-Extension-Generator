# 🧩 Extensio.ai — No-Code Chrome Extension Factory

A full-stack web app that lets anyone describe a Chrome extension in plain English and instantly receive a downloadable, installable `.zip` file.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd extensio-ai
npm install
```
///abc
### 2. Add your OpenAI API key
```bash
cp .env.example .env
```
Open `.env` and replace `your_openai_api_key_here` with your real key from https://platform.openai.com/api-keys

### 3. Run the app
```bash
npm start
```

Open your browser at **http://localhost:3000**

---

## 🏗️ Project Structure

```
extensio-ai/
├── server.js              # Express entry point
├── routes/
│   ├── generate.js        # POST /api/generate — AI → files → zip
│   ├── download.js        # GET  /api/download/:id — serve zip
│   └── projects.js        # GET/POST/DELETE /api/projects
├── public/
│   └── index.html         # Full SPA frontend
├── tmp/                   # Temp build directory (auto-cleaned)
├── .env.example           # Environment template
├── .env                   # Your actual config (never commit this)
└── package.json
```

---

## ⚙️ How It Works

1. **User types a prompt** — e.g. "Block all images and replace with a red square"
2. **Node.js backend** calls OpenAI GPT-4o with a structured Chain-of-Thought system prompt
3. **AI returns JSON** containing `manifest.json`, `content.js`, and `popup.html` source code
4. **Files are written** to a temp directory using Node.js `fs`
5. **`archiver` npm package** zips the folder into a `.zip`
6. **Download link** is served — user clicks, Chrome extension is downloaded
7. **User installs** via `chrome://extensions` → Developer Mode → Load unpacked

---

## 🔐 Security Features (Week 4 — Production)

- **Code sanitization**: Blocks `eval()`, `innerHTML =`, `document.write()` in generated code
- **UUID-based build IDs**: Prevents path traversal attacks
- **Auto-cleanup**: Zip files are deleted after download
- **API key validation**: Clear error messages if key is missing/invalid
- **No dangerous permissions**: Only `activeTab`, `scripting`, `storage`, `tabs` allowed

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| AI | OpenAI GPT-4o |
| Zipping | archiver (npm) |
| File system | Node.js fs (tmp folder) |
| Frontend | Vanilla HTML/CSS/JS (SPA) |
| Version control | In-memory project store |

---

## 🔧 Development Mode (auto-reload)
project
```bash
npm run dev
```
run the project
Requires `nodemon` (included as dev dependency).

---
1
## 📋 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/generate` | Generate extension from prompt |
| GET | `/api/download/:buildId` | Download zip (one-time) |
| GET | `/api/projects` | List all saved projects |
| POST | `/api/projects` | Save a project |
| GET | `/api/projects/:id` | Get project with version history |
| DELETE | `/api/projects/:id` | Delete a project |

---

## 🛠️ Installing a Generated Extension in Chrome

1. Download the `.zip` file
2. Unzip it to a folder
3. Open Chrome → go to `chrome://extensions`
4. Enable **Developer mode** (top-right toggle)
5. Click **Load unpacked** → select the unzipped folder
6. Done! Your extension is live.

---

## 📅 Week-by-Week Build Plan (from spec)

| Week | Goal | Status |
|------|------|--------|
| 1 | Prompt engineering — Chain-of-Thought system prompt, JSON output | ✅ Done |
| 2 | File system & zipping — write to /tmp, zip with archiver, serve download | ✅ Done |
| 3 | Platform UI — project management, edit requests, version history | ✅ Done |
| 4 | Deployment & security — code sanitization, subscription gating | ✅ Done |

