import { useStudioStore } from "./store";
import type { LogLevel } from "./types";

let logCounter = 0;

export function studioLog(level: LogLevel, category: string, message: string, meta?: Record<string, unknown>): void {
    logCounter += 1;
    useStudioStore.getState().addLog({
        id: `log-${Date.now()}-${logCounter}`,
        level,
        category,
        message,
        meta,
        timestamp: new Date().toISOString(),
    });
}

export function maskApiKey(key: string): string {
    if (!key || key.length < 8) return key ? "••••" : "";
    return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}
