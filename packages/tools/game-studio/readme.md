# Babylon Game Studio v2

Full commercial game development hub — **3 playable prototypes**, asset library, AI/BYOK agents, idea lab, activity logs, and PM command center.

## Quick Start

```bash
cd packages/tools/game-studio
npm install --ignore-scripts
npm run dev
```

Open **http://localhost:1342**

## Studio Tabs

| Tab | Purpose |
|-----|---------|
| **Games** | All 3 prototypes in layered order (switch via cards) |
| **Command** | Kanban roadmap, Kickstarter readiness, revenue milestones, autopilot |
| **Concepts** | Top 3 ranked commercial pitches |
| **Assets** | Track Babylon CDN + local + generated assets per game |
| **AI Hub** | BYOK (OpenAI, Anthropic), Ollama local, agents, subscription burn |
| **Idea Lab** | Prompt → game concept (AI or heuristic fallback) |
| **Logs** | Full activity stream — games, assets, AI runs, promotions |

## 3-Game Stack (Layer Order)

### Layer 1 — Neon Pulse Arena *(live)*
Arcade aerial score-attack. **WASD** to fly, collect orbs, dodge blocks.
- Fastest path to trailer + itch.io demo + first dollars

### Layer 2 — Orbital Forge *(prototype)*
Zero-G factory on orbital ring. **Click** pad to place modules, watch production tick.
- Highest Kickstarter ceiling ($180K target)

### Layer 3 — Echo Realms *(prototype)*
Co-op dimensional puzzle. **WASD** move, **E** switch player, **Q** shift dimension.
- Both players on pressure plates to open gate

## AI Setup (BYOK + Ollama)

1. Go to **AI Hub**
2. Paste API key for OpenAI or Anthropic (stored in browser localStorage only)
3. Or enable **Ollama**: `ollama serve` + `ollama pull llama3.2`
4. Set default provider, run agents or generate ideas in **Idea Lab**

Without keys, the studio uses a built-in heuristic generator — still produces usable concepts.

## Data Persistence

All studio data persists in browser localStorage:
- Asset library
- API keys (never sent to our servers)
- Generated ideas
- Activity logs
- PM kanban state

## Production Build

```bash
npm run build
npm run preview
```

Deploy `dist/` for public demo URL (Kickstarter / Steam Coming Soon).

## Architecture

```
src/
├── game/           # Neon Pulse, Orbital Forge, Echo Realms
├── studio/         # Unified store, types, AI, logger
├── panels/         # Assets, AI Hub, Idea Lab, Logs
├── dashboard/      # PM command center
└── components/     # Studio shell
```

## License

Apache-2.0
