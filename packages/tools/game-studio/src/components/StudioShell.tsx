import type { ReactNode } from "react";
import type { StudioTab } from "../App";

interface StudioShellProps {
    activeTab: StudioTab;
    onTabChange: (tab: StudioTab) => void;
    children: ReactNode;
}

const TABS: { id: StudioTab; label: string; hint: string }[] = [
    { id: "play", label: "Play Slice", hint: "Vertical slice prototype" },
    { id: "dashboard", label: "Command Center", hint: "Roadmap & revenue ops" },
    { id: "concepts", label: "Game Concepts", hint: "Top-tier pitch targets" },
];

export function StudioShell({ activeTab, onTabChange, children }: StudioShellProps) {
    return (
        <div className="studio">
            <header className="studio-header">
                <div className="studio-brand">
                    <span className="studio-logo" aria-hidden>
                        ◆
                    </span>
                    <div>
                        <h1>Babylon Game Studio</h1>
                        <p>From vertical slice → Kickstarter → first dollars</p>
                    </div>
                </div>
                <nav className="studio-nav" aria-label="Studio sections">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            className={activeTab === tab.id ? "nav-btn active" : "nav-btn"}
                            onClick={() => onTabChange(tab.id)}
                            title={tab.hint}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </header>
            <main className="studio-main">{children}</main>
        </div>
    );
}
