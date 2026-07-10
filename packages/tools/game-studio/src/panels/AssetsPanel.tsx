import { useState } from "react";
import { useStudioStore } from "../studio/store";
import type { AssetType, AssetSource, GameId } from "../studio/types";

export function AssetsPanel() {
    const { assets, addAsset, updateAsset, removeAsset } = useStudioStore();
    const [filter, setFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", type: "mesh" as AssetType, source: "local" as AssetSource, url: "", tags: "" });

    const filtered = assets.filter(
        (a) =>
            !filter ||
            a.name.toLowerCase().includes(filter.toLowerCase()) ||
            a.tags.some((t) => t.includes(filter.toLowerCase()))
    );

    const handleAdd = () => {
        if (!form.name.trim()) return;
        addAsset({
            name: form.name,
            type: form.type,
            source: form.source,
            url: form.url || undefined,
            tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        });
        setForm({ name: "", type: "mesh", source: "local", url: "", tags: "" });
        setShowForm(false);
    };

    return (
        <div className="panel-page">
            <header className="panel-header-row">
                <div>
                    <h2>Asset Library</h2>
                    <p>Track Babylon CDN assets, local files, and generated content across all games.</p>
                </div>
                <button type="button" className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "+ Add Asset"}
                </button>
            </header>

            {showForm && (
                <div className="form-card">
                    <input placeholder="Asset name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as AssetType })}>
                        {["mesh", "texture", "environment", "audio", "shader", "script", "concept", "other"].map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as AssetSource })}>
                        {["babylon-cdn", "local", "generated", "external"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <input placeholder="URL (optional)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
                    <input placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                    <button type="button" className="btn-primary" onClick={handleAdd}>Save Asset</button>
                </div>
            )}

            <input className="search-input" placeholder="Filter assets..." value={filter} onChange={(e) => setFilter(e.target.value)} />

            <div className="asset-grid">
                {filtered.map((asset) => (
                    <article key={asset.id} className="asset-card">
                        <div className="asset-card-header">
                            <span className={`type-badge ${asset.type}`}>{asset.type}</span>
                            <span className="source-badge">{asset.source}</span>
                        </div>
                        <h3>{asset.name}</h3>
                        {asset.url && (
                            <a href={asset.url} target="_blank" rel="noreferrer" className="asset-url">
                                {asset.url.slice(0, 50)}…
                            </a>
                        )}
                        {asset.gameId && <span className="game-tag">{asset.gameId}</span>}
                        <div className="tag-row">
                            {asset.tags.map((t) => (
                                <span key={t} className="tag">{t}</span>
                            ))}
                        </div>
                        <div className="asset-actions">
                            <select
                                value={asset.gameId ?? ""}
                                onChange={(e) => updateAsset(asset.id, { gameId: (e.target.value || undefined) as GameId | undefined })}
                                aria-label="Assign game"
                            >
                                <option value="">Unassigned</option>
                                <option value="neon-pulse">Neon Pulse</option>
                                <option value="orbital-forge">Orbital Forge</option>
                                <option value="echo-realms">Echo Realms</option>
                            </select>
                            <button type="button" className="btn-danger-sm" onClick={() => removeAsset(asset.id)}>Remove</button>
                        </div>
                    </article>
                ))}
            </div>
            <p className="meta-text">{filtered.length} assets tracked · persisted locally</p>
        </div>
    );
}
