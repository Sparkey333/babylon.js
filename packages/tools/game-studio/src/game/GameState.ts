export type GamePhase = "menu" | "playing" | "paused" | "gameover";

export interface GameStats {
    score: number;
    combo: number;
    orbsCollected: number;
    timeAlive: number;
    highScore: number;
}

const STORAGE_KEY = "bjs-game-studio-highscore";

export function loadHighScore(): number {
    try {
        return Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    } catch {
        return 0;
    }
}

export function saveHighScore(score: number): void {
    try {
        localStorage.setItem(STORAGE_KEY, String(score));
    } catch {
        /* ignore */
    }
}

export function createInitialStats(): GameStats {
    return {
        score: 0,
        combo: 0,
        orbsCollected: 0,
        timeAlive: 0,
        highScore: loadHighScore(),
    };
}
