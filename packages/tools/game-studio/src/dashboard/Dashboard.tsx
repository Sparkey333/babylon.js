import { useState, useEffect } from "react";
import { useProjectStore } from "./store";
import { GAME_CONCEPTS, getConceptById } from "./data/gameConcepts";
import { KICKSTARTER_CHECKLIST } from "./data/roadmap";
import type { TaskStatus } from "./data/roadmap";

const STATUS_COLUMNS: { id: TaskStatus; label: string }[] = [
    { id: "backlog", label: "Backlog" },
    { id: "in_progress", label: "In Progress" },
    { id: "review", label: "Review" },
    { id: "done", label: "Done" },
];

interface DashboardProps {
    initialSection?: "overview" | "concepts";
}

export function Dashboard({ initialSection = "overview" }: DashboardProps) {
    const [section, setSection] = useState(initialSection);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const {
        tasks,
        phases,
        totalRevenue,
        revenueMilestones,
        selectedConcept,
        kickstarterReadyScore,
        autopilotEnabled,
        lastAutopilotRun,
        setConcept,
        setTaskStatus,
        addRevenue,
        toggleAutopilot,
        runAutopilotNow,
        getPhaseProgress,
    } = useProjectStore();

    const concept = getConceptById(selectedConcept);

    useEffect(() => {
        setSection(initialSection);
    }, [initialSection]);

    const handleAutopilot = () => {
        const s = runAutopilotNow();
        setSuggestions(s);
    };

    return (
        <div className="dashboard">
            {section === "concepts" ? (
                <ConceptsPanel selected={selectedConcept} onSelect={setConcept} />
            ) : (
                <>
                    <div className="dash-metrics">
                        <MetricCard label="Kickstarter Readiness" value={`${kickstarterReadyScore}%`} accent />
                        <MetricCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} />
                        <MetricCard label="Active Concept" value={concept.name} />
                        <MetricCard label="KS Goal" value={`$${concept.kickstarterGoal.toLocaleString()}`} />
                    </div>

                    <div className="dash-grid">
                        <section className="dash-panel">
                            <div className="panel-header">
                                <h2>Production Roadmap</h2>
                                <div className="autopilot-controls">
                                    <label className="toggle">
                                        <input type="checkbox" checked={autopilotEnabled} onChange={toggleAutopilot} />
                                        Autopilot
                                    </label>
                                    <button type="button" className="btn-secondary" onClick={handleAutopilot}>
                                        Run Now
                                    </button>
                                </div>
                            </div>
                            {lastAutopilotRun && (
                                <p className="meta-text">Last autopilot: {new Date(lastAutopilotRun).toLocaleString()}</p>
                            )}
                            {suggestions.length > 0 && (
                                <ul className="suggestions">
                                    {suggestions.map((s) => (
                                        <li key={s}>{s}</li>
                                    ))}
                                </ul>
                            )}
                            <div className="phase-track">
                                {phases.map((phase) => (
                                    <div key={phase.id} className="phase-chip">
                                        <span>{phase.name}</span>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${getPhaseProgress(phase.id)}%` }} />
                                        </div>
                                        <small>{getPhaseProgress(phase.id)}%</small>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="dash-panel">
                            <h2>Revenue Milestones</h2>
                            <ul className="milestone-list">
                                {revenueMilestones.map((m) => (
                                    <li key={m.id} className={m.achieved ? "achieved" : ""}>
                                        <span>{m.label}</span>
                                        <span className="channel">{m.channel}</span>
                                        {m.achieved ? "✓" : `$${m.amount}`}
                                    </li>
                                ))}
                            </ul>
                            <div className="revenue-actions">
                                <button type="button" className="btn-secondary" onClick={() => addRevenue(1, "r2")}>
                                    +$1 (test sale)
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => addRevenue(100, "r3")}>
                                    +$100
                                </button>
                            </div>
                        </section>

                        <section className="dash-panel wide">
                            <h2>Kanban — Ship to First Dollars</h2>
                            <div className="kanban">
                                {STATUS_COLUMNS.map((col) => (
                                    <div key={col.id} className="kanban-col">
                                        <h3>{col.label}</h3>
                                        {tasks
                                            .filter((t) => t.status === col.id)
                                            .map((task) => (
                                                <div key={task.id} className="task-card">
                                                    <span className={`priority ${task.priority}`}>{task.priority}</span>
                                                    <h4>{task.title}</h4>
                                                    <p>{task.description}</p>
                                                    <div className="task-meta">
                                                        <span>{task.category}</span>
                                                        <span>💰 impact {task.revenueImpact}/10</span>
                                                    </div>
                                                    {col.id !== "done" && (
                                                        <select
                                                            value={task.status}
                                                            onChange={(e) => setTaskStatus(task.id, e.target.value as TaskStatus)}
                                                            aria-label={`Move ${task.title}`}
                                                        >
                                                            {STATUS_COLUMNS.map((s) => (
                                                                <option key={s.id} value={s.id}>
                                                                    {s.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="dash-panel">
                            <h2>Kickstarter Checklist</h2>
                            <ul className="ks-checklist">
                                {KICKSTARTER_CHECKLIST.map((item) => (
                                    <li key={item.id}>
                                        <span>{item.label}</span>
                                        <span>{item.weight}%</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </>
            )}
        </div>
    );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className={accent ? "metric-card accent" : "metric-card"}>
            <label>{label}</label>
            <strong>{value}</strong>
        </div>
    );
}

function ConceptsPanel({
    selected,
    onSelect,
}: {
    selected: string;
    onSelect: (id: "orbital-forge" | "neon-pulse" | "echo-realms") => void;
}) {
    return (
        <div className="concepts-panel">
            <header>
                <h2>Top 3 Godmode Game Concepts</h2>
                <p>Ranked for Kickstarter viability, Babylon.js technical fit, and path to first revenue.</p>
            </header>
            <div className="concept-grid">
                {GAME_CONCEPTS.map((concept, index) => (
                    <article
                        key={concept.id}
                        className={selected === concept.id ? "concept-card selected" : "concept-card"}
                        onClick={() => onSelect(concept.id)}
                        onKeyDown={(e) => e.key === "Enter" && onSelect(concept.id)}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="concept-rank">#{index + 1}</div>
                        <h3>{concept.name}</h3>
                        <p className="tagline">{concept.tagline}</p>
                        <div className="concept-scores">
                            <span>Market: {concept.marketScore}/100</span>
                            <span>Babylon fit: {concept.babylonStrength}/100</span>
                        </div>
                        <p className="edge">{concept.competitiveEdge}</p>
                        <h4>Babylon Superpowers</h4>
                        <ul>
                            {concept.babylonFeatures.map((f) => (
                                <li key={f}>{f}</li>
                            ))}
                        </ul>
                        <h4>Premium Assets & Tools</h4>
                        <ul>
                            {concept.assetHighlights.slice(0, 4).map((a) => (
                                <li key={a}>{a}</li>
                            ))}
                        </ul>
                        <div className="concept-footer">
                            <span>KS Goal: ${concept.kickstarterGoal.toLocaleString()}</span>
                            <span>Slice: {concept.demoScopeWeeks}</span>
                        </div>
                        {selected === concept.id && <div className="selected-badge">Active Project</div>}
                    </article>
                ))}
            </div>
        </div>
    );
}
