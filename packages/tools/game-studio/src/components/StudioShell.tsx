import type { ReactNode } from "react";
import type { StudioTab } from "../App";
import { useStudioStore } from "../studio/store";

interface StudioShellProps {
    activeTab: StudioTab;
    onTabChange: (tab: StudioTab) => void;
    children: ReactNode;
}

const NAV: { id: StudioTab; label: string; hint: string; group: string }[] = [
    { id: "play", label: "Games", hint: "All 3 prototypes", group: "Build" },
    { id: "command", label: "Command", hint: "Roadmap & revenue", group: "Ship" },
    { id: "concepts", label: "Concepts", hint: "Top 3 pitches", group: "Ship" },
    { id: "assets", label: "Assets", hint: "Asset library", group: "Studio" },
    { id: "ai", label: "AI Hub", hint: "BYOK & agents", group: "Studio" },
    { id: "ideas", label: "Idea Lab", hint: "Prompt → concept", group: "Studio" },
    { id: "logs", label: "Logs", hint: "Activity stream", group: "Studio" },
];

export function StudioShell({ activeTab, onTabChange, children }: StudioShellProps) {
    const logCount = useStudioStore((s) => s.logs.length);
    const ideaCount = useStudioStore((s) => s.ideas.length);

    return (
        <div className="studio">
            <header className="studio-header">
                <div className="studio-brand">
                    <span className="studio-logo" aria-hidden>◆</span>
                    <div>
                        <h1>Babylon Game Studio</h1>
                        <p>3 games · assets · AI · agents · autopilot to revenue</p>
                    </div>
                </div>
                <nav className="studio-nav" aria-label="Studio sections">
                    {NAV.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            className={activeTab === tab.id ? "nav-btn active" : "nav-btn"}
                            onClick={() => onTabChange(tab.id)}
                            title={tab.hint}
                        >
                            {tab.label}
                            {tab.id === "logs" && logCount > 0 && <span className="nav-badge">{logCount > 99 ? "99+" : logCount}</span>}
                            {tab.id === "ideas" && ideaCount > 0 && <span className="nav-badge accent">{ideaCount}</span>}
                        </button>
                    ))}
                </nav>
            </header>
            <main className="studio-main">{children}</main>
        </div>
    );
}
