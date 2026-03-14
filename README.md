# ALONE CODE STUDIO v3 🚀

A professional, fully featured **web-based IDE** built with Vue 3 + CodeMirror 6.  
Deploy directly to **GitHub Pages** — zero build step required!

## ✨ Features

- 🌐 **24 Programming Languages** including the new additions: JSON, YAML, Dart, R, Scala
- 🤖 **AI Assistant** powered by Claude (Anthropic API)
- 🖥️ **Interactive Terminal** with command history
- 📂 **File Tree Explorer** with rename, delete, folder support
- ↔️ **Split View** editor with drag-to-resize
- 🎨 **Glassmorphism UI** with 4 themes (One Dark, Monokai, GitHub Dark, Light)
- 🔍 **Find & Replace** inline
- 💾 **Auto-save** to localStorage
- ⌨️ **Keyboard Shortcuts** (Ctrl+Enter, Ctrl+S, Ctrl+F, Ctrl+B, Ctrl+\\)
- 📱 **Mobile Responsive**
- ▶️ **Live Code Execution** via Piston API

## 🆕 New Languages (v3 Upgrade)

| Language | Icon | Extension | Execution |
|----------|------|-----------|-----------|
| JSON     | 📋   | `.json`   | Local parse & format |
| YAML     | 📄   | `.yaml`   | Local preview |
| Dart     | 🎯   | `.dart`   | Piston API |
| R        | 📊   | `.r`      | Piston API |
| Scala    | 🔺   | `.scala`  | Piston API |

## 🚀 Deploy to GitHub Pages

1. **Fork or clone** this repository
2. Go to **Settings → Pages**
3. Set source to **GitHub Actions**
4. Push to `main` — the workflow auto-deploys!

Your IDE will be live at: `https://<username>.github.io/<repo-name>/`

## 🤖 AI Assistant Setup

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Open the IDE → click the **AI** button (top right)
3. Go to **⚙️ Settings → Anthropic API Key**
4. Paste your key — it's stored only in your browser

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Run code |
| `Ctrl+S` | Save all files |
| `Ctrl+F` | Find & Replace |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+\` | Toggle split view |
| `Ctrl+/` | Toggle comment |
| `Escape` | Close panels |

## 🏗️ Project Structure

```
alone-code-studio-v3/
├── index.html              # UI & Vue template
├── main.js                 # App logic + 24 language configs
├── style.css               # Glassmorphism styling
├── .github/
│   └── workflows/
│       └── deploy.yml      # Auto-deploy to GitHub Pages
├── .gitignore
└── README.md
```

## 🛠️ Tech Stack

- **Vue 3** (CDN, no build step)
- **CodeMirror 6** (via esm.sh)
- **Piston API** (free code execution)
- **Anthropic Claude API** (AI assistant)

---

Made with ❤️ by **ALONE CODE**
