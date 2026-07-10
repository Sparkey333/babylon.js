import { type LifeZoneId } from "./data/lifeZones";
import { type Project } from "./data/projects";

export interface CockpitSceneApi {
    focusZone(zoneId: LifeZoneId): void;
    highlightProject(project: Project | null): void;
    setCameraSensitivity(value: number): void;
}

export interface DebugLogEntry {
    id: string;
    timestamp: Date;
    level: "info" | "warn" | "error" | "debug";
    source: string;
    message: string;
}

let logCounter = 0;

export function createLogEntry(level: DebugLogEntry["level"], source: string, message: string): DebugLogEntry {
    return {
        id: `log-${++logCounter}`,
        timestamp: new Date(),
        level,
        source,
        message,
    };
}

export const RETRO_COLORS = {
    bg: "#050510",
    panel: "rgba(8, 12, 32, 0.92)",
    border: "rgba(0, 229, 255, 0.35)",
    glow: "#00e5ff",
    magenta: "#ff00aa",
    amber: "#ffaa00",
    text: "#c8e8ff",
    muted: "#5a7a99",
    scanline: "rgba(0, 229, 255, 0.03)",
} as const;

export const STATUS_LABELS = {
    active: "ACTIVE",
    debugging: "DEBUG",
    paused: "PAUSED",
    archived: "ARCHIVED",
} as const;
