# Krish Thakur — Interactive Dual-Mode Portfolio

[![Live Demo](https://img.shields.io/badge/Live%20Demo-krish--hghs.onrender.com-4ecca3?style=for-the-badge&logo=render&logoColor=white)](https://krish-hghs.onrender.com/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/State-Zustand%205-brown?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![Framer Motion](https://img.shields.io/badge/Motion-Framer%20Motion-ff0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

> A developer portfolio engineered with two distinct operational interfaces: an interactive **UNIX Terminal emulator (CLI)** and a **macOS Sonoma-inspired Desktop environment (GUI)**. Fully responsive, client-side rendered, and built with zero heavy UI component libraries.

🔗 **Live Deployment:** [https://krish-hghs.onrender.com/](https://krish-hghs.onrender.com/)

---

## 🖥️ Exploration Modes

Visitors choose their preferred way to browse upon entering:

### 1. GUI Mode (macOS-Style Desktop Environment)
An authentic desktop windowing system built natively in React:
- **Window Management**: Draggable, resizable, and stackable floating windows powered by `react-rnd`.
- **macOS Window Chrome**: Authentic traffic light buttons (close, minimize, maximize) featuring expanded 25px hit-targets for effortless clicking without accidental window dragging.
- **Glassmorphism & Aesthetics**: Dark OLED color palette, backdrop blur (`backdrop-filter: blur(32px)`), subtle specular borders, and high-resolution wallpaper.
- **Interactive Dock**: Dock featuring custom icons, active app indicators, magnification, and 1-click window launching.
- **Menu Bar**: Live system clock, system status, and 1-click switcher back to CLI mode.

#### GUI Applications:
- **About**: Profile overview, education highlights, and live social links.
- **Projects**: Interactive cards displaying tech stacks, architecture overviews, GitHub repositories, and live project demos.
- **Skills**: Categorized technical proficiencies (Languages, Frontend, Backend, Databases, CS Fundamentals, Tools).
- **Experience & Education**: Chitkara University CS engineering track (CGPA 9.94/10) alongside achievement badges (600+ LeetCode problems solved, HackIndia Hackathon).
- **Resume**: Standalone integrated document viewer with vertical scrolling, image preview, zoom, and instant PDF download.
- **Contact**: Fast communication hub with 1-click clipboard copying and direct Gmail Web Compose integration.
- **Terminal App**: Embedded UNIX terminal window fully synced with the CLI engine.

---

### 2. CLI Mode (Interactive Terminal Emulator)
A lightweight command-line interface with a custom tokenizer and execution engine:
- **Command Parser**: Handles arguments, flags (`--download`), and pipeline-ready input strings.
- **Command History**: Navigate previous inputs using `↑` (Arrow Up) and `↓` (Arrow Down).
- **Tab Autocomplete**: Autocompletes commands and virtual filesystem entries on `Tab`.
- **Keyboard Shortcuts**:
  - `Ctrl + L`: Clear the terminal screen.
  - `Ctrl + C`: Abort current command line with `^C` and return a fresh prompt.
- **Theme Engine**: Switch between color themes in real time (`theme hacker`, `theme matrix`, `theme synthwave`).
- **Virtual Filesystem**: Explore virtual directories using standard bash commands: `ls`, `cd`, `pwd`, `cat`.
- **Session Control**: `restart` (or `reset`) restores the initial ASCII welcome screen in-memory without refreshing the page; `gui` transitions straight to the desktop.

#### Available CLI Commands:
| Command | Description | Example / Usage |
| :--- | :--- | :--- |
| `help` | Lists all supported commands | `help` |
| `about` | Personal background and developer profile | `about` |
| `skills` | Technical skills grouped by stack category | `skills` |
| `projects` | Summary of all engineering projects | `projects` |
| `project <name>` | Deep-dive breakdown of a specific project | `project quick-pull` |
| `experience` | Experience overview and project history | `experience` |
| `education` | Degree, coursework, and university stats | `education` |
| `contact` | Email, LinkedIn, GitHub, and location | `contact` |
| `resume` | Render text resume or trigger direct download | `resume` or `resume --download` |
| `whoami` / `neofetch`| Displays developer bio and system spec overview | `whoami` |
| `theme <name>` | Switches color scheme (`hacker`, `matrix`, `synthwave`) | `theme matrix` |
| `ls`, `cd`, `cat`, `pwd` | Virtual filesystem navigation and file inspection | `ls`, `cat bio.txt` |
| `history` | Displays log of entered commands | `history` |
| `date` / `echo` | Prints current timestamp or echoed text | `echo Hello World` |
| `clear` | Clears terminal screen output (`Ctrl+L`) | `clear` |
| `restart` / `reset` | Restores the initial ASCII welcome interface | `restart` |
| `gui` | Switches into GUI Desktop Mode | `gui` |
| `sudo hire-me` | Easter egg with authenticated developer summary | `sudo hire-me` |

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: React 18 (Strict Mode, hooks, lazy loading & code-splitting)
- **Build System**: Vite 6 (ESM dev server & rollup asset bundling)
- **State Architecture**: Zustand 5 (Decoupled window management & z-index tracking)
- **Window Drag & Resize**: `react-rnd`
- **Transitions & Micro-interactions**: Framer Motion
- **Styling**: Native CSS Modules with design tokens (`tokens.css`, `global.css`)
- **Icons**: Lucide React + custom high-resolution icon assets
- **Deployment**: Render (Static Web Service with client-side SPA routing)

---

## 📂 Project Structure

```text
Portfolio/
├── public/
│   ├── img/
│   │   ├── icons/            # App and dock icon assets
│   │   ├── Me.jpeg           # Profile portrait
│   │   ├── Resume.pdf        # Curated PDF resume
│   │   └── wallpaper.webp    # High-resolution desktop background
│   └── resume.html           # Standalone clean PDF viewer
├── src/
│   ├── cli/                  # Command-line interface engine
│   │   ├── commands/         # Modular command definitions (help, projects, etc.)
│   │   ├── commandRegistry.jsx # Dynamic command registration & Levenshtein matching
│   │   ├── fileSystem.jsx    # Virtual in-memory file tree
│   │   ├── parser.jsx        # Lexer & input parser
│   │   ├── Terminal.jsx      # Core terminal emulator component
│   │   ├── useTerminal.jsx   # Terminal state hook (history, input, streams)
│   │   └── WelcomeBanner.jsx # ASCII branding & profile header
│   ├── gui/                  # Desktop GUI environment
│   │   ├── apps/             # Independent desktop app windows
│   │   ├── store/            # Zustand window manager store (useWindowStore.js)
│   │   ├── Desktop.jsx       # Canvas containing icons, dock, and windows
│   │   ├── Dock.jsx          # Interactive bottom dock
│   │   ├── MenuBar.jsx       # macOS-style top system bar
│   │   └── Window.jsx        # Floating window shell with traffic light controls
│   ├── modes/                # Route mode wrappers (CliMode, GuiMode)
│   ├── services/
│   │   └── dataService.js    # Single source of truth data abstraction layer
│   ├── styles/               # CSS Modules and global token definitions
│   ├── App.jsx               # Mode router & Landing page component
│   └── main.jsx              # Application bootstrap
├── package.json
└── vite.config.js
```

---

## 🚀 Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/krishthakur248/Portfolio.git
   cd Portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Create a production build:**
   ```bash
   npm run build
   ```

5. **Preview the production build locally:**
   ```bash
   npm run preview
   ```

---

## 🌐 Deployment Configuration (Render)

For hosting on **Render** (or Netlify/Vercel) as a Static Site:

| Setting | Value |
| :--- | :--- |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### SPA Rewrite Rule
To support client-side routing and prevent 404s on refresh:
- **Source**: `/*`
- **Destination**: `/index.html`
- **Action**: `Rewrite`

---

## 📬 Contact & Connect

- **Name**: Krish Thakur
- **Email**: [krishthakur248@gmail.com](mailto:krishthakur248@gmail.com)
- **GitHub**: [github.com/krishthakur248](https://github.com/krishthakur248)
- **LinkedIn**: [linkedin.com/in/krish-thakur-](https://linkedin.com/in/krish-thakur-/)
- **LeetCode**: [leetcode.com/krishthakur248](https://leetcode.com/krishthakur248)
- **Live Portfolio**: [https://krish-hghs.onrender.com/](https://krish-hghs.onrender.com/)

---

© 2026 Krish Thakur. Built with React and Vite.
