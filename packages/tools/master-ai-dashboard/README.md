# Master AI Command Center (`@tools/master-ai-dashboard`)

Retro 90s space-cockpit dashboard with life-zone projects, Pinterest inspiration, and Debug Bay.

## Local Mac (target for now)

### Dev server

```bash
npm install
npm run build:dev
npm run serve -w @tools/master-ai-dashboard
```

Open: [http://localhost:1347](http://localhost:1347)  
Setup / keys page: [http://localhost:1347/setup.html](http://localhost:1347/setup.html)

### Package a fresh DMG (this Mac only)

```bash
cd packages/tools/master-ai-dashboard
npm run package:mac
```

When it finishes, Finder refreshes and the **new `.dmg`** under `release/` opens automatically.  
Drag **Master AI Command Center** into Applications, then launch.

Docs: [Electron Builder — Mac](https://www.electron.build/configuration/mac)

## Setup steps & key site URLs

Full clickable checklist lives in:

- In-app pane: **Setup & Keys**
- Static page: [`public/setup.html`](./public/setup.html) (also served as `/setup.html`)

| Need | Official URL |
|------|----------------|
| Pinterest Developers | https://developers.pinterest.com/ |
| Set up Pinterest app | https://developers.pinterest.com/docs/getting-started/set-up-app/ |
| Pinterest Apps Console (keys) | https://developers.pinterest.com/apps/ |
| Pinterest Authentication | https://developers.pinterest.com/docs/getting-started/authentication/ |
| Pinterest API v5 | https://developers.pinterest.com/docs/api/v5/ |
| OpenAI API keys | https://platform.openai.com/api-keys |
| Anthropic API keys | https://console.anthropic.com/settings/keys |
| Node.js LTS | https://nodejs.org/en/download |
| Babylon.js docs | https://doc.babylonjs.com/ |
| Electron Mac DMG | https://www.electron.build/configuration/mac |

Copy `.env.local` from the template in Setup (never commit secrets).
