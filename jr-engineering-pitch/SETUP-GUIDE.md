# JR Engineering AI Initiative — Setup & Order of Operations

Prepared for team lead role · Ansom Outdoor LLC (civil) + AI/ML portfolio · Pitch to Daniel

---

## Recommended architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC FACE (2 sites)                     │
├──────────────────────────┬──────────────────────────────────┤
│  ansomoutdoor.com        │  yourname.dev / ai.jrengineering │
│  (Civil / client-facing) │  (Coding / AI / ML portfolio)    │
│  · Services & case studies│  · Wargame engine repos          │
│  · Embedded scenario demos│  · Wallet / agent apps           │
│  · Office visit schedule  │  · Live playgrounds              │
│  · Download takeoffs      │  · GitHub + technical depth      │
└────────────┬─────────────┴──────────────┬───────────────────┘
             │                            │
             └──────────┬─────────────────┘
                        ▼
         ┌──────────────────────────────┐
         │  SHARED BACKEND (later)      │
         │  · Scenario JSON/CSV library │
         │  · Vercel / static hosting   │
         │  · Budget wallet app         │
         │  · Auth for client portal    │
         └──────────────────────────────┘
```

**Why two sites:** Civil clients don't care about your GitHub stars. Tech partners don't care about your levee takeoffs. Cross-link them — civil site says "powered by our AI lab"; tech site says "applied to civil infrastructure."

---

## Order of operations (do not skip)

### Phase 0 — This week (before office visits)

| Step | Action | Output | Time |
|------|--------|--------|------|
| 1 | Present pitch deck to Daniel | Budget approval Tier 1 | 30 min meeting |
| 2 | Deploy `jr-engineering-pitch/` to Vercel | Shareable URL | 15 min |
| 3 | Record wargame demo video (<3 min) | Unlisted Loom/YouTube link | 45 min |
| 4 | Send Daniel: deck URL + demo URL + 3 CSVs | Email with companion hub | 10 min |
| 5 | Get Tier 1 budget on company card | Cursor seat funded | — |

### Phase 1 — Weeks 2–4 (Simple tier)

| Step | Action |
|------|--------|
| 6 | Register `ansomoutdoor.com` (or subdomain) — single-page civil landing |
| 7 | Register portfolio domain — link GitHub, live demos, this repo |
| 8 | Cross-link both sites |
| 9 | First office visit — laptop + live demo URL + printed cheat sheet |
| 10 | Collect feedback form → backlog scenario #2 |

### Phase 2 — Month 2 (Next Level)

| Step | Action |
|------|--------|
| 11 | Add 2–4 more Cursor/Claude seats (kill your personal rate limits) |
| 12 | Build shared **project wallet** app — track AI spend per proposal |
| 13 | Add 3+ scenarios to library (different civil use cases) |
| 14 | Password-protected client demo page |
| 15 | Pitch Tier 2 with a client win story |

### Phase 3 — Quarter 2 (Godmode)

| Step | Action |
|------|--------|
| 16 | GIS import (DEM, shapefiles) into wargame engine |
| 17 | Auto-generate Excel/PDF from scenario runs |
| 18 | Multi-tenant platform — license scenario packs |
| 19 | Formal AI training certification for field staff |
| 20 | Hire part-time dev or intern |

---

## Breaking past personal limits

| Limit you hit | Root cause | Fix at tier |
|---------------|------------|-------------|
| Cursor rate limits | 1 personal account | Tier 2: 3–5 Business seats on company |
| "Fable" / tool caps | Personal free tiers | Company-paid Claude Team + API budget |
| Can't run wargame + website + training prep in parallel | Serial context switching | Parallel seats + shared repo |
| No budget visibility | Personal card | Wallet app + `ai-budget-tracker.csv` |
| Demos not shareable | Localhost only | Vercel deploy (this package) |
| Office visits feel one-off | No curriculum | Repeatable 3-hour module in deck |

**Key insight:** You're not asking for "AI toys." You're asking to budget AI like survey equipment — per-seat, per-project, with deliverables attached.

---

## Budget summary

| Tier | Monthly | What it buys |
|------|---------|--------------|
| **Simple** | ~$160 | 1 seat, hosting, 1 scenario, 2 office visits/quarter |
| **Next Level** | ~$800 | 3–5 seats, wallet app, 5 scenarios, monthly training |
| **Godmode** | ~$3–8K | Full platform, GIS, GPU, certification, revenue product |

Open `deliverables/ai-budget-tracker.csv` in Excel for line-item detail.

---

## File map (this package)

```
jr-engineering-pitch/
├── index.html              ← Pitch deck for Daniel (start here)
├── companion.html          ← Deliverables hub (send this link)
├── SETUP-GUIDE.md          ← This file
├── wargame-demo/
│   └── index.html          ← Live 3D scenario (record video from here)
└── deliverables/
    ├── scenario-levee-breach-matrix.csv
    ├── civil-takeoff-template.csv
    └── ai-budget-tracker.csv
```

---

## Quick deploy (Vercel)

```bash
cd jr-engineering-pitch
npx vercel --yes
# Or: connect GitHub repo in vercel.com dashboard, set root directory to jr-engineering-pitch
```

---

## Office visit kit (bring this)

- [ ] Laptop with demo URLs bookmarked
- [ ] HDMI adapter
- [ ] Printed 1-pager: "3 things AI does for civil" (export slide 6 from deck)
- [ ] Feedback form (Google Form: "What scenario should we build next?")
- [ ] USB with CSV deliverables (backup if WiFi fails)

---

## Next builds (your premade apps)

When you connect your existing wargame/wallet apps to this hub:

1. Add links in `companion.html` under "Live demos"
2. Embed iframe or deep-link into Ansom civil site
3. Wallet app tracks spend per scenario ID (e.g. `LEVEE-L14-A`)
4. Same scenario JSON feeds 3D demo + Excel export + video script

This repo's wargame demo is a **stand-in** using Babylon.js CDN — swap in your production app when hosted.
