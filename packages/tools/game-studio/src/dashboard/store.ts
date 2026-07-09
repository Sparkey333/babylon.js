import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
    INITIAL_TASKS,
    PHASES,
    REVENUE_MILESTONES,
    type ProjectSnapshot,
    type TaskStatus,
    type RevenueMilestone,
} from "./data/roadmap";
import { runAutopilot, moveTask, phaseProgress } from "./autopilot";
import type { GameConcept } from "./data/gameConcepts";

interface ProjectStore extends ProjectSnapshot {
    setConcept: (id: GameConcept["id"]) => void;
    setTaskStatus: (taskId: string, status: TaskStatus) => void;
    addRevenue: (amount: number, milestoneId?: string) => void;
    toggleAutopilot: () => void;
    runAutopilotNow: () => string[];
    getPhaseProgress: (phaseId: string) => number;
    resetProject: () => void;
}

const initialState: ProjectSnapshot = {
    selectedConcept: "neon-pulse",
    phases: PHASES,
    tasks: INITIAL_TASKS,
    revenueMilestones: REVENUE_MILESTONES,
    totalRevenue: 0,
    autopilotEnabled: true,
    lastAutopilotRun: null,
    kickstarterReadyScore: 35,
};

export const useProjectStore = create<ProjectStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setConcept: (id) => set({ selectedConcept: id }),

            setTaskStatus: (taskId, status) => {
                set((state) => {
                    const tasks = moveTask(state.tasks, taskId, status);
                    const kickstarterReadyScore = runAutopilot({ ...state, tasks }).kickstarterScore;
                    return { tasks, kickstarterReadyScore };
                });
                if (get().autopilotEnabled) {
                    get().runAutopilotNow();
                }
            },

            addRevenue: (amount, milestoneId) => {
                set((state) => {
                    const totalRevenue = state.totalRevenue + amount;
                    const revenueMilestones = state.revenueMilestones.map((m: RevenueMilestone) => {
                        if (milestoneId && m.id === milestoneId) return { ...m, achieved: true };
                        if (!m.achieved && m.amount > 0 && totalRevenue >= m.amount) {
                            return { ...m, achieved: true };
                        }
                        return m;
                    });
                    return { totalRevenue, revenueMilestones };
                });
            },

            toggleAutopilot: () => set((s) => ({ autopilotEnabled: !s.autopilotEnabled })),

            runAutopilotNow: () => {
                const state = get();
                const result = runAutopilot(state);
                const tasks = state.tasks.map((t) => {
                    if (result.unlocked.includes(t.id)) return { ...t, status: "in_progress" as TaskStatus };
                    if (result.advanced.includes(t.id)) return { ...t, status: "review" as TaskStatus };
                    return t;
                });
                set({
                    tasks,
                    kickstarterReadyScore: result.kickstarterScore,
                    lastAutopilotRun: new Date().toISOString(),
                });
                return result.suggestions;
            },

            getPhaseProgress: (phaseId) => phaseProgress(get().tasks, phaseId),

            resetProject: () => set({ ...initialState }),
        }),
        { name: "bjs-game-studio-pm" }
    )
);

// Auto-run autopilot on load
if (typeof window !== "undefined") {
    setTimeout(() => {
        useProjectStore.getState().runAutopilotNow();
    }, 500);
}
