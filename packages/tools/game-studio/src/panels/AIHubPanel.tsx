import { useState } from "react";
import { useStudioStore } from "../studio/store";
import { maskApiKey } from "../studio/logger";
import { runAgentTask } from "../studio/ai/ideaGenerator";
import type { AIProviderId } from "../studio/types";

export function AIHubPanel() {
    const { providers, agents, subscriptions, setProvider, setDefaultProvider, toggleAgent, updateAgent, recordAgentRun, monthlyBurn } =
        useStudioStore();
    const [agentOutput, setAgentOutput] = useState<Record<string, string>>({});
    const [agentTask, setAgentTask] = useState("");
    const [selectedAgent, setSelectedAgent] = useState(agents[0]?.id ?? "");

    const runAgent = async (agentId: string) => {
        const agent = agents.find((a) => a.id === agentId);
        if (!agent) return;
        const provider = providers.find((p) => p.id === agent.providerId) ?? providers.find((p) => p.isDefault)!;
        const task = agentTask || "Review current vertical slice and suggest next 3 shipping tasks.";
        const result = await runAgentTask(agent.name, task, provider);
        setAgentOutput((o) => ({ ...o, [agentId]: result }));
        recordAgentRun(agentId);
    };

    return (
        <div className="panel-page">
            <header className="panel-header-row">
                <div>
                    <h2>AI Hub — BYOK & Agents</h2>
                    <p>Bring your own API keys (OpenAI, Anthropic) or run Ollama locally. Keys stored in browser only.</p>
                </div>
                <div className="metric-inline">
                    <label>Monthly burn</label>
                    <strong>${monthlyBurn()}/mo</strong>
                </div>
            </header>

            <div className="dash-grid">
                <section className="dash-panel">
                    <h3>AI Providers (BYOK)</h3>
                    {providers.map((p) => (
                        <div key={p.id} className="provider-row">
                            <div className="provider-info">
                                <label>
                                    <input
                                        type="radio"
                                        name="defaultProvider"
                                        checked={p.isDefault}
                                        onChange={() => setDefaultProvider(p.id)}
                                    />
                                    {p.name}
                                </label>
                                <label className="toggle-inline">
                                    <input
                                        type="checkbox"
                                        checked={p.enabled}
                                        onChange={(e) => setProvider(p.id, { enabled: e.target.checked })}
                                    />
                                    Enabled
                                </label>
                            </div>
                            {p.id !== "local" && p.id !== "cursor" && (
                                <>
                                    <input
                                        type="password"
                                        placeholder={p.apiKey ? maskApiKey(p.apiKey) : "Paste API key (sk-...)"}
                                        onChange={(e) => setProvider(p.id, { apiKey: e.target.value, enabled: true })}
                                    />
                                    <input
                                        value={p.baseUrl}
                                        onChange={(e) => setProvider(p.id, { baseUrl: e.target.value })}
                                        placeholder="Base URL"
                                    />
                                    <input
                                        value={p.model}
                                        onChange={(e) => setProvider(p.id, { model: e.target.value })}
                                        placeholder="Model"
                                    />
                                </>
                            )}
                            {p.id === "ollama" && (
                                <p className="hint-text">Run: <code>ollama serve</code> then <code>ollama pull llama3.2</code></p>
                            )}
                        </div>
                    ))}
                </section>

                <section className="dash-panel">
                    <h3>Subscriptions & Tools</h3>
                    <ul className="sub-list">
                        {subscriptions.map((s) => (
                            <li key={s.id} className={s.active ? "active" : "inactive"}>
                                <span>{s.name}</span>
                                <span className="sub-vendor">{s.vendor}</span>
                                <span>${s.costMonthly}/mo</span>
                                <span className={`cat-badge ${s.category}`}>{s.category}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="dash-panel wide">
                    <h3>Studio Agents</h3>
                    <div className="agent-task-bar">
                        <input
                            placeholder="Task for agent (e.g. Write Kickstarter reward tiers for Neon Pulse)"
                            value={agentTask}
                            onChange={(e) => setAgentTask(e.target.value)}
                        />
                        <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
                            {agents.map((a) => (
                                <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                            ))}
                        </select>
                        <button type="button" className="btn-primary" onClick={() => runAgent(selectedAgent)}>Run Agent</button>
                    </div>
                    <div className="agent-grid">
                        {agents.map((agent) => (
                            <div key={agent.id} className="agent-card">
                                <div className="agent-header">
                                    <strong>{agent.name}</strong>
                                    <span className={`role-badge ${agent.role}`}>{agent.role}</span>
                                </div>
                                <p className="agent-prompt">{agent.systemPrompt.slice(0, 80)}…</p>
                                <div className="agent-meta">
                                    <span>Provider: {agent.providerId}</span>
                                    <span>Runs: {agent.tasksCompleted}</span>
                                </div>
                                <label className="toggle-inline">
                                    <input type="checkbox" checked={agent.enabled} onChange={() => toggleAgent(agent.id)} />
                                    {agent.enabled ? "Active" : "Disabled"}
                                </label>
                                <select
                                    value={agent.providerId}
                                    onChange={(e) => updateAgent(agent.id, { providerId: e.target.value as AIProviderId })}
                                >
                                    {providers.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <button type="button" className="btn-secondary" onClick={() => runAgent(agent.id)}>Run</button>
                                {agentOutput[agent.id] && (
                                    <pre className="agent-output">{agentOutput[agent.id]}</pre>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
