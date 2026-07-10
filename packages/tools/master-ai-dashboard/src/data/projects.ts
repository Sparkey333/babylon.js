import { type LifeZoneId, type ProjectStatus } from "./lifeZones";

export interface Project {
    id: string;
    name: string;
    zone: LifeZoneId;
    status: ProjectStatus;
    description: string;
    tags: string[];
    lastActive: string;
    progress: number;
    pinned: boolean;
}

export const DEFAULT_PROJECTS: readonly Project[] = [
    {
        id: "proj-master-dashboard",
        name: "Master AI Dashboard",
        zone: "work",
        status: "active",
        description: "3D cockpit command center with life-zone organization",
        tags: ["babylon", "react", "3d"],
        lastActive: "now",
        progress: 72,
        pinned: true,
    },
    {
        id: "proj-pinterest-sync",
        name: "Pinterest Inspiration Sync",
        zone: "creative",
        status: "debugging",
        description: "Pull mood boards and reference pins into the cockpit HUD",
        tags: ["pinterest", "api", "design"],
        lastActive: "2m ago",
        progress: 45,
        pinned: true,
    },
    {
        id: "proj-fitness-tracker",
        name: "Fitness Tracker",
        zone: "personal",
        status: "active",
        description: "Weekly routines and recovery metrics",
        tags: ["health", "mobile"],
        lastActive: "1h ago",
        progress: 60,
        pinned: false,
    },
    {
        id: "proj-rust-course",
        name: "Rust Systems Course",
        zone: "learning",
        status: "paused",
        description: "Chapter 12 — ownership patterns in async code",
        tags: ["rust", "course"],
        lastActive: "3d ago",
        progress: 38,
        pinned: false,
    },
    {
        id: "proj-api-gateway",
        name: "API Gateway Refactor",
        zone: "work",
        status: "debugging",
        description: "Tracing latency spikes in production edge routes",
        tags: ["backend", "perf"],
        lastActive: "15m ago",
        progress: 55,
        pinned: true,
    },
    {
        id: "proj-synth-album",
        name: "Retro Synth Album",
        zone: "creative",
        status: "active",
        description: "90s space-cockpit inspired ambient tracks",
        tags: ["music", "synth"],
        lastActive: "4h ago",
        progress: 28,
        pinned: false,
    },
    {
        id: "proj-inspector-cli",
        name: "Inspector CLI Bridge",
        zone: "debug",
        status: "active",
        description: "AI agent scene inspection and screenshot pipeline",
        tags: ["ai", "babylon", "cli"],
        lastActive: "now",
        progress: 90,
        pinned: true,
    },
    {
        id: "proj-home-automation",
        name: "Home Automation Hub",
        zone: "personal",
        status: "debugging",
        description: "MQTT sensor mesh dropping packets on reboot",
        tags: ["iot", "mqtt"],
        lastActive: "30m ago",
        progress: 67,
        pinned: false,
    },
] as const;

export function projectsByZone(projects: readonly Project[], zone: LifeZoneId): Project[] {
    return projects.filter((p) => p.zone === zone).sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        if (a.status === "debugging" && b.status !== "debugging") return -1;
        if (b.status === "debugging" && a.status !== "debugging") return 1;
        return a.name.localeCompare(b.name);
    });
}

export function activeProjectCount(projects: readonly Project[]): number {
    return projects.filter((p) => p.status === "active" || p.status === "debugging").length;
}
