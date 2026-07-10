import { useState } from "react";
import { useStudioStore } from "../studio/store";
import { generateGameIdea } from "../studio/ai/ideaGenerator";
import { studioLog } from "../studio/logger";

export function IdeaLabPanel() {
    const { providers, ideas, addIdea, promoteIdea, removeIdea } = useStudioStore();
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState<string | null>(null);

    const defaultProvider = providers.find((p) => p.isDefault);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        studioLog("info", "idea-lab", `User prompt: ${prompt}`);
        try {
            const idea = await generateGameIdea(prompt, providers);
            addIdea(idea);
            setPrompt("");
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = (ideaId: string, title: string) => {
        promoteIdea(ideaId);
        studioLog("success", "idea-lab", `Promoted "${title}" to active pipeline`);
    };

    const presets = [
        "Co-op horror in a submarine with procedural leaks and voice chat",
        "Roguelite deckbuilder where cards are 3D buildings you place in a city",
        "Zen gardening sim with seasonal Babylon.js atmosphere and weather",
        "Esports spectator mode for aerial combat with cinematic camera AI",
    ];

    return (
        <div className="panel-page">
            <header className="panel-header-row">
                <div>
                    <h2>Idea Lab</h2>
                    <p>Generate commercial game concepts from prompts — BYOK OpenAI/Anthropic, Ollama local, or built-in heuristic.</p>
                </div>
                <span className="provider-pill">
                    Active: {defaultProvider?.name ?? "Heuristic"} {defaultProvider?.apiKey ? "🔑" : ""}
                </span>
            </header>

            <div className="idea-input-card">
                <textarea
                    placeholder="Describe your game idea… e.g. 'Multiplayer factory game on Mars with destructible terrain and drone swarms'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                />
                <div className="idea-actions">
                    <button type="button" className="btn-primary" onClick={handleGenerate} disabled={loading || !prompt.trim()}>
                        {loading ? "Generating…" : "Generate Concept"}
                    </button>
                </div>
                <div className="preset-row">
                    <span>Quick prompts:</span>
                    {presets.map((p) => (
                        <button key={p} type="button" className="preset-btn" onClick={() => setPrompt(p)}>
                            {p.slice(0, 40)}…
                        </button>
                    ))}
                </div>
            </div>

            <div className="ideas-list">
                {ideas.length === 0 && (
                    <p className="empty-state">No generated ideas yet. Enter a prompt above or configure BYOK in AI Hub.</p>
                )}
                {ideas.map((idea) => (
                    <article key={idea.id} className={`idea-card ${idea.promotedToProject ? "promoted" : ""}`}>
                        <div className="idea-header">
                            <h3>{idea.title}</h3>
                            <span className="score-badge">{idea.marketScore}/100</span>
                            <span className="provider-badge">{idea.providerUsed}</span>
                        </div>
                        <p className="tagline">{idea.tagline}</p>
                        <button type="button" className="expand-btn" onClick={() => setExpanded(expanded === idea.id ? null : idea.id)}>
                            {expanded === idea.id ? "Collapse" : "Details"}
                        </button>
                        {expanded === idea.id && (
                            <div className="idea-details">
                                <p><strong>Genre:</strong> {idea.genre}</p>
                                <p><strong>Hook:</strong> {idea.hook}</p>
                                <p><strong>Kickstarter:</strong> {idea.kickstarterAngle}</p>
                                <p><strong>MVP:</strong> {idea.mvpScope}</p>
                                <p><strong>Babylon:</strong> {idea.babylonFeatures.join(", ")}</p>
                                <p><strong>Monetization:</strong> {idea.monetization.join(" · ")}</p>
                                <p className="prompt-echo"><em>Prompt: {idea.prompt}</em></p>
                            </div>
                        )}
                        <div className="idea-footer">
                            <span>{new Date(idea.createdAt).toLocaleString()}</span>
                            {!idea.promotedToProject ? (
                                <>
                                    <button type="button" className="btn-secondary" onClick={() => handlePromote(idea.id, idea.title)}>
                                        Add to Pipeline
                                    </button>
                                    <button type="button" className="btn-danger-sm" onClick={() => removeIdea(idea.id)}>Delete</button>
                                </>
                            ) : (
                                <span className="promoted-label">✓ In pipeline</span>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
