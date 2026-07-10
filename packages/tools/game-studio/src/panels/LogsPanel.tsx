import { useState } from "react";
import { useStudioStore } from "../studio/store";
import type { LogLevel } from "../studio/types";

const LEVELS: LogLevel[] = ["info", "success", "warn", "error", "ai"];

export function LogsPanel() {
    const { logs, clearLogs } = useStudioStore();
    const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");
    const [categoryFilter, setCategoryFilter] = useState("");

    const categories = [...new Set(logs.map((l) => l.category))];

    const filtered = logs.filter((l) => {
        if (levelFilter !== "all" && l.level !== levelFilter) return false;
        if (categoryFilter && l.category !== categoryFilter) return false;
        return true;
    });

    return (
        <div className="panel-page">
            <header className="panel-header-row">
                <div>
                    <h2>Activity Logs</h2>
                    <p>Studio events, AI runs, asset changes, game switches — all tracked locally.</p>
                </div>
                <button type="button" className="btn-secondary" onClick={clearLogs}>Clear Logs</button>
            </header>

            <div className="log-filters">
                <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as LogLevel | "all")}>
                    <option value="all">All levels</option>
                    {LEVELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                    ))}
                </select>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">All categories</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <span className="meta-text">{filtered.length} entries</span>
            </div>

            <div className="log-stream">
                {filtered.map((log) => (
                    <div key={log.id} className={`log-entry ${log.level}`}>
                        <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`log-level ${log.level}`}>{log.level}</span>
                        <span className="log-category">{log.category}</span>
                        <span className="log-message">{log.message}</span>
                        {log.meta && (
                            <code className="log-meta">{JSON.stringify(log.meta)}</code>
                        )}
                    </div>
                ))}
                {filtered.length === 0 && <p className="empty-state">No log entries match filters.</p>}
            </div>
        </div>
    );
}
