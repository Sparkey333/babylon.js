import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
    BABYLON_ASSET_CATALOG,
    DEFAULT_AGENTS,
    DEFAULT_PROVIDERS,
    DEFAULT_SUBSCRIPTIONS,
    type AIProviderConfig,
    type AIProviderId,
    type GeneratedIdea,
    type GameId,
    type StudioAgent,
    type StudioAsset,
    type StudioLog,
    type LogLevel,
    type Subscription,
} from "./types";

function uid(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function now(): string {
    return new Date().toISOString();
}

function makeLog(level: LogLevel, category: string, message: string): StudioLog {
    return { id: uid("log"), level, category, message, timestamp: now() };
}

function prependLog(logs: StudioLog[], entry: StudioLog): StudioLog[] {
    return [entry, ...logs].slice(0, 500);
}

function seedAssets(): StudioAsset[] {
    return BABYLON_ASSET_CATALOG.map((a) => ({
        ...a,
        id: uid("asset"),
        createdAt: now(),
        updatedAt: now(),
    }));
}

function seedAgents(): StudioAgent[] {
    return DEFAULT_AGENTS.map((a) => ({
        ...a,
        id: uid("agent"),
        tasksCompleted: 0,
        lastRunAt: null,
    }));
}

function seedSubscriptions(): Subscription[] {
    return DEFAULT_SUBSCRIPTIONS.map((s) => ({ ...s, id: uid("sub") }));
}

interface StudioStore {
    assets: StudioAsset[];
    providers: AIProviderConfig[];
    agents: StudioAgent[];
    subscriptions: Subscription[];
    logs: StudioLog[];
    ideas: GeneratedIdea[];
    activeGameId: GameId;

    addAsset: (asset: Omit<StudioAsset, "id" | "createdAt" | "updatedAt">) => void;
    updateAsset: (id: string, patch: Partial<StudioAsset>) => void;
    removeAsset: (id: string) => void;

    setProvider: (id: AIProviderId, patch: Partial<AIProviderConfig>) => void;
    setDefaultProvider: (id: AIProviderId) => void;

    updateAgent: (id: string, patch: Partial<StudioAgent>) => void;
    toggleAgent: (id: string) => void;
    recordAgentRun: (id: string) => void;

    addSubscription: (sub: Omit<Subscription, "id">) => void;
    updateSubscription: (id: string, patch: Partial<Subscription>) => void;

    addLog: (log: StudioLog) => void;
    clearLogs: () => void;

    addIdea: (idea: GeneratedIdea) => void;
    promoteIdea: (id: string) => void;
    removeIdea: (id: string) => void;

    setActiveGame: (id: GameId) => void;

    monthlyBurn: () => number;
}

export const useStudioStore = create<StudioStore>()(
    persist(
        (set, get) => ({
            assets: seedAssets(),
            providers: DEFAULT_PROVIDERS,
            agents: seedAgents(),
            subscriptions: seedSubscriptions(),
            logs: [],
            ideas: [],
            activeGameId: "neon-pulse",

            addAsset: (asset) => {
                const entry: StudioAsset = { ...asset, id: uid("asset"), createdAt: now(), updatedAt: now() };
                set((s) => ({
                    assets: [entry, ...s.assets],
                    logs: prependLog(s.logs, makeLog("success", "assets", `Added asset: ${entry.name}`)),
                }));
            },

            updateAsset: (id, patch) => {
                set((s) => ({
                    assets: s.assets.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: now() } : a)),
                }));
            },

            removeAsset: (id) => {
                set((s) => {
                    const asset = s.assets.find((a) => a.id === id);
                    return {
                        assets: s.assets.filter((a) => a.id !== id),
                        logs: asset ? prependLog(s.logs, makeLog("info", "assets", `Removed asset: ${asset.name}`)) : s.logs,
                    };
                });
            },

            setProvider: (id, patch) => {
                set((s) => ({
                    providers: s.providers.map((p) => (p.id === id ? { ...p, ...patch } : p)),
                    logs: patch.apiKey !== undefined ? prependLog(s.logs, makeLog("info", "ai", `API key updated for ${id}`)) : s.logs,
                }));
            },

            setDefaultProvider: (id) => {
                set((s) => ({
                    providers: s.providers.map((p) => ({ ...p, isDefault: p.id === id })),
                    logs: prependLog(s.logs, makeLog("info", "ai", `Default AI provider set to ${id}`)),
                }));
            },

            toggleAgent: (id) => {
                set((s) => ({
                    agents: s.agents.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
                }));
            },

            updateAgent: (id, patch) => {
                set((s) => ({
                    agents: s.agents.map((a) => (a.id === id ? { ...a, ...patch } : a)),
                }));
            },

            recordAgentRun: (id) => {
                set((s) => ({
                    agents: s.agents.map((a) =>
                        a.id === id ? { ...a, tasksCompleted: a.tasksCompleted + 1, lastRunAt: now() } : a
                    ),
                }));
            },

            addSubscription: (sub) => {
                set((s) => ({
                    subscriptions: [{ ...sub, id: uid("sub") }, ...s.subscriptions],
                    logs: prependLog(s.logs, makeLog("info", "subs", `Added subscription: ${sub.name}`)),
                }));
            },

            updateSubscription: (id, patch) => {
                set((s) => ({
                    subscriptions: s.subscriptions.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)),
                }));
            },

            addLog: (log) => {
                set((s) => ({ logs: [log, ...s.logs].slice(0, 500) }));
            },

            clearLogs: () => set({ logs: [] }),

            addIdea: (idea) => {
                set((s) => ({ ideas: [idea, ...s.ideas] }));
            },

            promoteIdea: (id) => {
                set((s) => {
                    const idea = s.ideas.find((i) => i.id === id);
                    return {
                        ideas: s.ideas.map((i) => (i.id === id ? { ...i, promotedToProject: true } : i)),
                        logs: idea ? prependLog(s.logs, makeLog("success", "idea-lab", `Promoted to project pipeline: ${idea.title}`)) : s.logs,
                    };
                });
            },

            removeIdea: (id) => {
                set((s) => ({ ideas: s.ideas.filter((i) => i.id !== id) }));
            },

            setActiveGame: (id) => {
                set((s) => ({
                    activeGameId: id,
                    logs: prependLog(s.logs, makeLog("info", "game", `Switched to ${id}`)),
                }));
            },

            monthlyBurn: () => get().subscriptions.filter((s) => s.active).reduce((sum, s) => sum + s.costMonthly, 0),
        }),
        {
            name: "bjs-game-studio-v2",
            partialize: (s) => ({
                assets: s.assets,
                providers: s.providers,
                agents: s.agents,
                subscriptions: s.subscriptions,
                logs: s.logs.slice(0, 200),
                ideas: s.ideas,
                activeGameId: s.activeGameId,
            }),
        }
    )
);

if (typeof window !== "undefined") {
    const s = useStudioStore.getState();
    if (s.logs.length === 0) {
        useStudioStore.setState({
            logs: [makeLog("success", "system", "Babylon Game Studio v2 initialized — 3-game stack + AI hub ready")],
        });
    }
}
