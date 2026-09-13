# MossDiorama

An interactive 3D storybook diorama and dual-mode portfolio crafted with Three.js, React Three Fiber, and Tailwind CSS.

---

## Overview

MossDiorama bridges immersive 3D world-building with modern editorial web design. Visitors can wander through a low-poly storybook clearing as an inquisitive feline explorer or switch seamlessly into a high-contrast 2D reading view framed by an authentic mathematical ASCII donut animation.

---

## Key Features

### 1. Interactive 3D Storybook Realm
- **Low-Poly Terrain Diorama**: Procedurally grounded landscape featuring monolith clearings, foliage, ponds, and directional signboards.
- **Living Wildlife**: Reactive ecological entities including perching forest parrots, schooling river fish, shoreline frogs, and solitary woodland foxes distributed across the perimeter.
- **Retro Tin-Toy Robots**: Sprite-animated robotic companions, including a Jamming Robot stationed beside an interactive vinyl turntable by the lake with dynamic BPM head-bobbing and musical sparkle particles.
- **Third-Person Locomotion**: Dual-input navigation supporting click-to-move pathfinding and continuous keyboard steering (`W`, `A`, `S`, `D` or Arrow keys).
- **Camera Rig**: Damped spherical orbit controls with automated focus framing, strict fog boundary clamping, and right-click context menu suppression.
- **Proximity Hysteresis**: Spatial state machine ensuring wildlife encounters, robot greetings, and landmark popups trigger cleanly on entrance without repetitive audio or modal spam.

### 2. 2D Editorial Reading View
- **Dual-Mode Architecture**: Instant transition between 3D world exploration and an editorial reading layout.
- **Mathematical ASCII Donut**: Andy Sloane's classic rotating 3D torus (`donut.c`) scaled to 130 columns by 52 rows as a fluid background watermark. Engineered using direct DOM ref updates and pre-allocated character buffers for zero React re-render overhead and sub-1% CPU consumption.
- **Curated Showcases**: Dedicated dossier views for engineering projects, technical writing, contact channels, and career history.
- **Editorial Typography**: Balanced typographic system pairing Instrument Serif, Newsreader, Cinzel, and JetBrains Mono.

### 3. Integrated ATS Resume Pipeline
- **LaTeX Source**: Production-ready 1-page ATS-compliant resume typeset in Bitstream Charter (`resume.tex`).
- **Synchronized Data Model**: Shared schema linking project descriptions, skill tags, academic background, and downloadable PDF assets across both 3D and 2D interfaces.

### 4. Procedural & Spatial Audio Hub
- **Web Audio API Sound Engine**: Surface-aware foley footstep generation (grass, stone, wood), rustling foliage, and ambient wildlife soundscapes.
- **Retro Synthesizer**: In-engine 8-bit chiptune groove riff played on robot interaction.
- **Lakeside Turntable**: Interactive record player with embedded track streaming and custom Spotify player controls.

---

## Controls

| Action | Control |
|---|---|
| Move Character | Click ground target or hold `W` / `A` / `S` / `D` (or Arrow keys) |
| Orbit Camera | Hold left click and drag |
| Zoom View | Mouse scroll wheel |
| Inspect Landmarks | Walk into clearing or click directional signboards |
| Toggle Mode | Switch between `3D Realm` and `2D View` in top navigation |
| Audio Controls | Sound mute toggle and Spotify hub docked on top-right header |

---

## Tech Stack

- **Core Framework**: React 19, Vite
- **3D Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), React Three Drei (`@react-three/drei`)
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Typesetting**: LaTeX (Bitstream Charter)

---

## Project Structure

```
MossDiorama/
├── public/
│   ├── assets/
│   │   ├── audio/           # Sound effects and ambient audio tracks
│   │   ├── fauna/           # Wildlife sprite assets (fish, parrots, frogs)
│   │   └── robots/          # Animated robot sprite sheets
│   └── resume.pdf           # Production ATS resume artifact
├── src/
│   ├── components/
│   │   ├── 3d/              # Scene setup, terrain, camera, fauna, robots
│   │   ├── common/          # AsciiDonut background and shared utilities
│   │   ├── hud/             # Header navigation, minimap, audio player
│   │   └── overlays/        # 3D realm dossiers and 2D full reading view
│   ├── data/                # Portfolio content, resume, and music metadata
│   ├── store/               # Zustand application and world state
│   ├── utils/               # SFX synthesizer and sound player
│   ├── App.jsx              # Main viewport orchestrator
│   └── main.jsx             # React entrypoint
├── resume/
│   ├── resume.pdf           # Compiled ATS resume PDF
│   └── resume.tex           # LaTeX source for ATS resume
├── index.html
├── package.json
└── vite.config.js
```

---

## Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HiteshTomar2004/MossDiorama.git
   cd MossDiorama
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

### Building for Production

To build optimized assets for deployment:

```bash
npm run build
```

The compiled output will be generated inside the `dist/` directory, ready to be hosted on Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

---

## License

MIT License. Designed and developed by Hitesh Tomar.
