import type { ProjectSnapshot, ProjectTask, TaskStatus } from "./data/roadmap";
import { KICKSTARTER_CHECKLIST } from "./data/roadmap";

export interface AutopilotResult {
    unlocked: string[];
    advanced: string[];
    kickstarterScore: number;
    suggestions: string[];
}

function taskById(tasks: ProjectTask[], id: string): ProjectTask | undefined {
    return tasks.find((t) => t.id === id);
}

function isDone(tasks: ProjectTask[], id: string): boolean {
    return taskById(tasks, id)?.status === "done";
}

export function computeKickstarterScore(tasks: ProjectTask[]): number {
    const weights = KICKSTARTER_CHECKLIST;
    let score = 0;

    const doneTitles = tasks.filter((t) => t.status === "done").map((t) => t.title.toLowerCase());

    for (const item of weights) {
        const keywordMap: Record<string, string[]> = {
            k1: ["trailer", "gameplay"],
            k2: ["vertical slice", "demo", "playable"],
            k3: ["budget"],
            k4: ["team"],
            k5: ["tier", "reward"],
            k6: ["discord", "press", "social"],
            k7: ["risk"],
            k8: ["timeline", "delivery"],
            k9: ["email", "landing"],
            k10: ["backer", "communication"],
        };
        const keywords = keywordMap[item.id] ?? [];
        const matched = doneTitles.some((title) => keywords.some((kw) => title.includes(kw)));
        if (matched) score += item.weight;
    }

    return Math.min(100, score);
}

export function runAutopilot(snapshot: ProjectSnapshot): AutopilotResult {
    const unlocked: string[] = [];
    const advanced: string[] = [];
    const tasks = snapshot.tasks.map((t) => ({ ...t }));

    for (const task of tasks) {
        if (task.status !== "backlog" || !task.autoUnlock?.length) continue;
        const canUnlock = task.autoUnlock.every((dep) => isDone(tasks, dep));
        if (canUnlock) {
            task.status = "in_progress";
            unlocked.push(task.id);
        }
    }

    const doneCount = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress");

    if (doneCount >= 2 && inProgress.length === 1) {
        const candidate = inProgress[0];
        if (candidate && candidate.id === "t3" && Math.random() > 0.3) {
            candidate.status = "review";
            advanced.push(candidate.id);
        }
    }

    const kickstarterScore = computeKickstarterScore(tasks);

    const suggestions: string[] = [];
    if (kickstarterScore < 40) {
        suggestions.push("Priority: finish playable demo link and trailer — these drive 35% of KS readiness.");
    }
    if (!tasks.some((t) => t.title.toLowerCase().includes("discord") && t.status !== "backlog")) {
        suggestions.push("Start community building early — Discord is your cheapest marketing channel.");
    }
    if (snapshot.totalRevenue < 1) {
        suggestions.push("Ship itch.io 'pay what you want' demo this week for first-dollar validation.");
    }
    if (tasks.filter((t) => t.status === "done").length >= 3 && kickstarterScore >= 35) {
        suggestions.push("You have enough for a soft crowdfunding pre-launch — set up Kickstarter 'notify me'.");
    }

    return { unlocked, advanced, kickstarterScore, suggestions };
}

export function moveTask(tasks: ProjectTask[], taskId: string, status: TaskStatus): ProjectTask[] {
    return tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
}

export function phaseProgress(tasks: ProjectTask[], phaseId: string): number {
    const phaseTasks = tasks.filter((t) => t.phaseId === phaseId);
    if (!phaseTasks.length) return 0;
    const done = phaseTasks.filter((t) => t.status === "done").length;
    return Math.round((done / phaseTasks.length) * 100);
}
