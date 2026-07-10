# Asset Bridge

Share 3D assets across **Babylon.js**, **Three.js**, and your other app repos using one manifest and glTF as the universal format.

## Why glTF is the bridge

| Engine | Loader | Same file? |
|--------|--------|------------|
| Babylon.js | `SceneLoader` / `LoadAssetContainerAsync` | ✅ `.glb` / `.gltf` |
| Three.js | `GLTFLoader` | ✅ `.glb` / `.gltf` |
| Your wargame app | Either engine | ✅ point manifest at your CDN |
| Your wallet app | Icons / 3D badges | ✅ same IDs |

Babylon-only formats (`.babylon`) work for local monorepo dev; production uses glTF from CDN.

## Asset sources (built-in)

| Source ID | Origin | Use for |
|-----------|--------|---------|
| `babylon-cdn` | assets.babylonjs.com | Production meshes, IBL environments |
| `threejs-examples` | threejs.org/examples/models/gltf | Soldier, cross-engine proof |
| `khronos-samples` | Khronos glTF Sample Models | CesiumMilkTruck (response vehicles) |
| `babylon-playground` | `packages/tools/playground/public/scenes` | Local monorepo dev only |
| `jr-wargame-app` | **Your repo** — set base URL | Custom scenario assets |
| `jr-wallet-app` | **Your repo** — set base URL | Wallet UI 3D icons |
| `jr-civil-portfolio` | **Your repo** — set base URL | Ansom civil project models |

## Wire your other repos (3 lines)

```javascript
const bridge = await AssetBridge.create({
  manifestUrl: '../asset-bridge/manifest.json',
});

// Point at your deployed apps or GitHub raw URLs
bridge.registerSource('jr-wargame-app', 'https://raw.githubusercontent.com/YOU/wargame/main/public/assets');
bridge.registerSource('jr-wallet-app', 'https://wallet.ansomoutdoor.com/assets');
bridge.registerSource('jr-civil-portfolio', 'https://cdn.ansomoutdoor.com/models');

await bridge.loadScenario(scene, 'levee-breach-L14');
```

Or edit `manifest.json` → `sources` → set `"base"` permanently.

## Three.js consumer (same manifest)

```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const manifest = await fetch('/asset-bridge/manifest.json').then(r => r.json());
const bridge = new AssetBridge(manifest);

for (const item of bridge.getThreeJSManifest()) {
  const gltf = await new GLTFLoader().loadAsync(item.url);
  gltf.scene.scale.setScalar(item.scale);
  scene.add(gltf.scene);
}
```

## Add a new asset

1. Drop `.glb` in your repo under `public/assets/`
2. Add entry to `manifest.json`:

```json
{
  "id": "my-pump-station",
  "name": "Pump Station",
  "tags": ["civil", "infrastructure"],
  "format": "glb",
  "source": "jr-wargame-app",
  "path": "infrastructure/pump-station.glb",
  "defaultScale": 2,
  "role": "prop"
}
```

3. Reference by ID in any app: `bridge.loadBabylon(scene, 'my-pump-station')`

## Scenario packs

Scenarios in `manifest.json` → `scenarios` define which assets spawn where. CSV deliverables can reference the same scenario ID (`LEVEE-L14-A` ↔ `levee-breach-L14`).

## Local monorepo vs deployed

| Environment | Playground assets | CDN assets |
|-------------|-------------------|------------|
| `file://` or localhost from repo | ✅ relative path to `packages/tools/playground` | ✅ |
| Vercel / Netlify (pitch folder only) | ❌ falls back to CDN | ✅ |

The wargame demo uses `playground-buggy` with automatic CDN fallback.
