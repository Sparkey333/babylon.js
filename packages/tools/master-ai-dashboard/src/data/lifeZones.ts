export type LifeZoneId = "work" | "creative" | "personal" | "learning" | "debug";

export type ProjectStatus = "active" | "debugging" | "paused" | "archived";

export interface LifeZone {
    id: LifeZoneId;
    label: string;
    color: string;
    accent: string;
    icon: string;
    description: string;
    /** 3D station angle around the cockpit ring (radians) */
    stationAngle: number;
}

export const LIFE_ZONES: readonly LifeZone[] = [
    {
        id: "work",
        label: "Work",
        color: "#00e5ff",
        accent: "#0066aa",
        icon: "⚡",
        description: "Professional builds, clients, and shipping code",
        stationAngle: 0,
    },
    {
        id: "creative",
        label: "Creative",
        color: "#ff00aa",
        accent: "#880066",
        icon: "✦",
        description: "Art, music, writing, and experimental ideas",
        stationAngle: Math.PI * 0.4,
    },
    {
        id: "personal",
        label: "Personal",
        color: "#aaff00",
        accent: "#446600",
        icon: "◈",
        description: "Health, home, relationships, and life admin",
        stationAngle: Math.PI * 0.8,
    },
    {
        id: "learning",
        label: "Learning",
        color: "#ffaa00",
        accent: "#885500",
        icon: "◎",
        description: "Courses, research, and skill building",
        stationAngle: Math.PI * 1.2,
    },
    {
        id: "debug",
        label: "Debug Bay",
        color: "#ff3333",
        accent: "#880000",
        icon: "⚙",
        description: "Always-on diagnostics, logs, and hot fixes",
        stationAngle: Math.PI * 1.6,
    },
] as const;

export function getLifeZone(id: LifeZoneId): LifeZone {
    return LIFE_ZONES.find((z) => z.id === id) ?? LIFE_ZONES[0];
}
