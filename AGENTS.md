# AGENTS.md

## Cursor Cloud specific instructions

Babylon.js is a large TypeScript monorepo (npm workspaces + nx/lerna). The update
script runs `npm install`, whose `prepare` lifecycle also builds the internal tools,
shared assets, and test tools. The notes below cover only non-obvious things for
running/testing after that.

### Toolchain
- Node must satisfy `engines` in `package.json` (`>=20.11.0 <23.0.0`); the VM's
  default Node 22 works. Do not switch to Node 23+.
- Standard scripts live in the root `package.json` (`scripts`). Prefer those over
  ad-hoc commands.

### Build
- `npm run build:dev` builds all dev packages and the dev-server declarations.
  Source lives in `packages/dev/*` and `packages/tools/*`.

### Lint / format
- Lint: `npm run lint:check` (ESLint, uses a cache; first run is slow).
- Format: `npm run format:check` (Prettier).

### Test
- Unit tests: `npm run test:unit` (Vitest, ~2900 tests, runs in ~1 min). It first
  builds the smart-filter shader assets, so run it via the script, not `vitest` directly.
- Visualization/integration/performance tests use Playwright (`npm run test:visualization`,
  etc.) and require Playwright browsers plus the dev server; they are heavier and not
  needed for most changes.

### Run the app (dev server)
- `npm run start` launches the Babylon dev server (webpack-dev-server) at
  `http://localhost:1337/`. It is a long-running watcher — start it in a background
  tmux session, not a foreground blocking call.
- Initial webpack compile takes ~50s; wait for `compiled successfully` in the log
  before hitting the page. `/babylon.js` is the freshly built engine (~50 MB dev bundle).
- The default page (`http://localhost:1337/`) renders a demo scene that downloads an
  animated robot model from `https://playground.babylonjs.com` (external CDN), so it
  needs network egress. The scene has on-screen green GUI buttons ("Play Walk", etc.)
  to trigger skeletal animations — a good end-to-end smoke test of the engine + GUI.
- The Playground editor (`packages/tools/playground`, Vite) and dev-host
  (`npm run start:devhost`) are separate apps if you need them.
