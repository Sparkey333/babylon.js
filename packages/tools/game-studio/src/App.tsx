import { useState } from "react";
import { GameView } from "./game/GameView";
import { Dashboard } from "./dashboard/Dashboard";
import { StudioShell } from "./components/StudioShell";

export type StudioTab = "play" | "dashboard" | "concepts";

export function App() {
    const [tab, setTab] = useState<StudioTab>("play");

    return (
        <StudioShell activeTab={tab} onTabChange={setTab}>
            {tab === "play" && <GameView />}
            {tab === "dashboard" && <Dashboard />}
            {tab === "concepts" && <Dashboard initialSection="concepts" />}
        </StudioShell>
    );
}
