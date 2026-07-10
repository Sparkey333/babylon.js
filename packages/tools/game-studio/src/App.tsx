import { useState } from "react";
import { GameLauncher } from "./game/GameLauncher";
import { Dashboard } from "./dashboard/Dashboard";
import { StudioShell } from "./components/StudioShell";
import { AssetsPanel } from "./panels/AssetsPanel";
import { AIHubPanel } from "./panels/AIHubPanel";
import { IdeaLabPanel } from "./panels/IdeaLabPanel";
import { LogsPanel } from "./panels/LogsPanel";

export type StudioTab = "play" | "command" | "assets" | "ai" | "ideas" | "logs" | "concepts";

export function App() {
    const [tab, setTab] = useState<StudioTab>("play");

    return (
        <StudioShell activeTab={tab} onTabChange={setTab}>
            {tab === "play" && <GameLauncher />}
            {tab === "command" && <Dashboard />}
            {tab === "concepts" && <Dashboard initialSection="concepts" />}
            {tab === "assets" && <AssetsPanel />}
            {tab === "ai" && <AIHubPanel />}
            {tab === "ideas" && <IdeaLabPanel />}
            {tab === "logs" && <LogsPanel />}
        </StudioShell>
    );
}
