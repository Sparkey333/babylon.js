# Babylon Game Studio

Commercial game development hub built on Babylon.js — evolved from the `create-babylonjs` starter into a **playable vertical slice** plus a **project management command center** designed to carry a title from prototype → Kickstarter → first revenue.

## Quick Start

```bash
cd packages/tools/game-studio
npm install
npm run dev
```

Open **http://localhost:1342**

| Tab | Purpose |
| --- | ------- |
| **Play Slice** | Play *Neon Pulse Arena* — arcade aerial score-attack prototype |
| **Command Center** | Kanban roadmap, revenue milestones, Kickstarter readiness, autopilot |
| **Game Concepts** | Top 3 commercial game pitches ranked for crowdfunding viability |

## What's Included

### Playable Vertical Slice — Neon Pulse Arena

- Third-person follow camera on the **acrobatic plane** glTF from `assets.babylonjs.com`
- PBR environment lighting (`environmentSpecular.env`)
- Glow layer + particle orbs + procedural obstacle spawning
- Score, combo, high-score persistence
- Ready for gameplay trailer capture

**Controls:** WASD / Arrow keys — collect cyan orbs, dodge red blocks.

### Project Management Dashboard

- **6-phase production roadmap** (Pre-Production → Scale)
- **Kanban task board** with revenue-impact scoring
- **Kickstarter readiness meter** (weighted checklist)
- **Revenue milestone tracker** ($1 → $100 → KS goal → launch week)
- **Autopilot engine** — auto-unlocks dependent tasks, surfaces next actions
- **Game concept selector** — switch active pitch target

### Evolved `create-babylonjs` CLI

The scaffold CLI now offers a **Commercial Game** template alongside the original viewer/scene starter. Generate a new game project:

```bash
npm create babylonjs
# Select: Project template → Commercial Game
```

## Top 3 Recommended Game Products

See the **Game Concepts** tab in the studio, or `src/dashboard/data/gameConcepts.ts`.

| Rank | Title | Why it's godmode |
| --- | --- | --- |
| **#1** | **Orbital Forge** | Factory/automation in orbit — proven KS genre, showcases Havok, thin instances, atmosphere addon |
| **#2** | **Neon Pulse Arena** | Fastest path to shippable demo (this vertical slice), viral score loops, browser-first |
| **#3** | **Echo Realms** | Co-op puzzle adventure — instant browser multiplayer link sharing is a marketing weapon |

## Path to First Dollars

1. **Week 1–2:** Polish vertical slice → record trailer → itch.io PWYW demo
2. **Week 3–4:** Steam Coming Soon + Discord + email landing page
3. **Week 5–8:** Playtest survey → Kickstarter pre-launch page
4. **Launch:** Premium unlock on Steam/itch + cosmetic DLC pipeline

## Production Build

```bash
npm run build
npm run preview
```

Deploy `dist/` to Vercel, Netlify, or GitHub Pages for a public demo URL (critical for Kickstarter).

## Architecture

```
src/
├── game/           # Babylon.js game engine + Neon Pulse Arena
├── dashboard/      # PM command center (Zustand store, autopilot)
├── components/     # Studio shell / navigation
└── styles/         # Global design system
```

## License

Apache-2.0 (consistent with Babylon.js monorepo)
