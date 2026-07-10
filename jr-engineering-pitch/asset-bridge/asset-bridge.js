/**
 * Asset Bridge — share 3D assets across Babylon.js, Three.js, and your other repos.
 * glTF is the universal bridge format; both engines load the same files.
 *
 * Usage (Babylon):
 *   const bridge = await AssetBridge.create({ manifestUrl: '../asset-bridge/manifest.json' });
 *   await bridge.loadScenario(scene, 'levee-breach-L14');
 *
 * Usage (register your repo):
 *   bridge.registerSource('jr-wargame-app', 'https://raw.githubusercontent.com/you/wargame/main/public/assets');
 */
class AssetBridge {
  constructor(manifest, options = {}) {
    this.manifest = manifest;
    this.options = {
      preferLocal: options.preferLocal ?? this._isLocalDev(),
      onProgress: options.onProgress ?? (() => {}),
      onLog: options.onLog ?? (() => {}),
      ...options,
    };
    this._loaded = new Map();
    this._containers = [];
  }

  static async create(options = {}) {
    const url = options.manifestUrl ?? new URL('manifest.json', import.meta.url).href;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`AssetBridge: failed to load manifest (${res.status})`);
    const manifest = await res.json();
    return new AssetBridge(manifest, options);
  }

  _isLocalDev() {
    return location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:';
  }

  /** Register or override a source base URL at runtime (wire your other repos here). */
  registerSource(sourceId, baseUrl) {
    if (!this.manifest.sources[sourceId]) {
      this.manifest.sources[sourceId] = { base: baseUrl, engine: 'both' };
    } else {
      this.manifest.sources[sourceId].base = baseUrl;
    }
    this.options.onLog(`Registered source "${sourceId}" → ${baseUrl}`);
  }

  getAsset(assetId) {
    const asset = this.manifest.assets.find((a) => a.id === assetId);
    if (!asset) throw new Error(`AssetBridge: unknown asset "${assetId}"`);
    return asset;
  }

  /** Resolve a loadable URL for an asset, with fallback chain. */
  resolveUrl(assetId) {
    const asset = this.getAsset(assetId);
    if (asset.placeholder) {
      const src = this.manifest.sources[asset.source];
      if (!src?.base) return null;
    }

    const tryResolve = (sourceId, path) => {
      const src = this.manifest.sources[sourceId];
      if (!src?.base) return null;
      const base = sourceId === 'babylon-playground' && !this.options.preferLocal
        ? src.baseDeployed
        : src.base;
      if (!base) return null;
      return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
    };

    let url = tryResolve(asset.source, asset.path);
    if (!url && asset.fallbackSource && asset.fallbackPath) {
      url = tryResolve(asset.fallbackSource, asset.fallbackPath);
      if (url) this.options.onLog(`Fallback: ${assetId} → ${url}`);
    }
    return url;
  }

  /** Load a single asset into a Babylon scene. Returns { meshes, animationGroups, root }. */
  async loadBabylon(scene, assetId, opts = {}) {
    const cacheKey = assetId + JSON.stringify(opts);
    if (this._loaded.has(cacheKey)) return this._loaded.get(cacheKey);

    const asset = this.getAsset(assetId);
    const url = this.resolveUrl(assetId);
    if (!url) {
      this.options.onLog(`Skipped placeholder asset: ${assetId}`);
      return { meshes: [], animationGroups: [], root: null, skipped: true };
    }

    if (asset.format === 'env') {
      const tex = BABYLON.CubeTexture.CreateFromPrefilteredData(url, scene);
      scene.environmentTexture = tex;
      scene.createDefaultSkybox(tex, true, 1000, 0.25);
      const result = { meshes: [], animationGroups: [], root: null, env: true };
      this._loaded.set(cacheKey, result);
      return result;
    }

    this.options.onProgress(assetId, 0);
    const ext = url.split('.').pop().split('?')[0].toLowerCase();
    const loaderExt = ext === 'babylon' ? '.babylon' : ext === 'gltf' ? '.gltf' : '.glb';

    const container = await BABYLON.SceneLoader.LoadAssetContainerAsync(url, '', scene, (ev) => {
      if (ev.lengthComputable) this.options.onProgress(assetId, ev.loaded / ev.total);
    }, loaderExt);

    container.addAllToScene();
    this._containers.push(container);

    const root = new BABYLON.TransformNode(`asset-${assetId}`, scene);
    container.meshes.forEach((m) => { if (!m.parent) m.parent = root; });

    const scale = opts.scale ?? asset.defaultScale ?? 1;
    root.scaling = new BABYLON.Vector3(scale, scale, scale);

    const rot = opts.rotation ?? asset.defaultRotation ?? [0, 0, 0];
    root.rotation = new BABYLON.Vector3(
      (rot[0] * Math.PI) / 180,
      (rot[1] * Math.PI) / 180,
      (rot[2] * Math.PI) / 180
    );

    if (opts.position) {
      root.position = new BABYLON.Vector3(opts.position[0], opts.position[1], opts.position[2]);
    }

    // Ground-align: sit asset on y=0
    if (opts.groundAlign !== false) {
      root.computeWorldMatrix(true);
      const bounds = root.getHierarchyBoundingVectors(true);
      const offsetY = opts.position ? opts.position[1] - bounds.min.y : -bounds.min.y;
      root.position.y = offsetY;
    }

    const result = {
      meshes: container.meshes,
      animationGroups: container.animationGroups,
      root,
      asset,
      url,
      playAnimation: (name) => {
        const ag = container.animationGroups.find((g) => g.name.includes(name)) ?? container.animationGroups[0];
        ag?.start(true);
      },
    };

    this._loaded.set(cacheKey, result);
    this.options.onProgress(assetId, 1);
    return result;
  }

  /** Load all assets defined for a scenario in manifest.scenarios */
  async loadScenario(scene, scenarioId) {
    const scenario = this.manifest.scenarios?.[scenarioId];
    if (!scenario) throw new Error(`AssetBridge: unknown scenario "${scenarioId}"`);

    const placed = [];
    for (const entry of scenario.assets) {
      const instances = entry.instances ?? [{}];
      for (const inst of instances) {
        const result = await this.loadBabylon(scene, entry.id, {
          position: inst.position,
          rotation: inst.rotation,
          scale: inst.scale,
        });
        if (result.root) {
          result.label = inst.label;
          placed.push(result);
          if (result.animationGroups?.length) result.playAnimation('Run');
        }
      }
    }
    return { scenario, placed };
  }

  /** Export manifest slice for Three.js apps — same IDs, same URLs */
  getThreeJSManifest() {
    return this.manifest.assets
      .filter((a) => a.format !== 'env' && !a.placeholder)
      .map((a) => ({
        id: a.id,
        name: a.name,
        url: a.threejsPath ?? this.resolveUrl(a.id),
        tags: a.tags,
        scale: a.defaultScale ?? 1,
      }))
      .filter((a) => a.url);
  }

  dispose() {
    this._containers.forEach((c) => c.dispose());
    this._containers = [];
    this._loaded.clear();
  }
}

// UMD export for script tag usage
if (typeof window !== 'undefined') window.AssetBridge = AssetBridge;
