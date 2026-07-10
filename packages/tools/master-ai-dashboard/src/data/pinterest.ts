export interface PinterestPin {
    id: string;
    title: string;
    imageUrl: string;
    boardName: string;
    link?: string;
}

export interface PinterestBoard {
    id: string;
    name: string;
    pinCount: number;
    coverImageUrl: string;
}

/** Demo pins — replace with live API once OAuth is configured */
export const DEMO_PINS: readonly PinterestPin[] = [
    {
        id: "pin-1",
        title: "Retro sci-fi cockpit HUD",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
        boardName: "Space Command",
        link: "https://pinterest.com",
    },
    {
        id: "pin-2",
        title: "Neon grid synthwave palette",
        imageUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&h=300&fit=crop",
        boardName: "90s Aesthetic",
        link: "https://pinterest.com",
    },
    {
        id: "pin-3",
        title: "Holographic UI panels",
        imageUrl: "https://images.unsplash.com/photo-1534796638762-b9bf681c55ce?w=400&h=300&fit=crop",
        boardName: "UI Inspiration",
        link: "https://pinterest.com",
    },
    {
        id: "pin-4",
        title: "Deep space nebula reference",
        imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop",
        boardName: "Space Command",
        link: "https://pinterest.com",
    },
    {
        id: "pin-5",
        title: "CRT scanline texture overlay",
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop",
        boardName: "90s Aesthetic",
        link: "https://pinterest.com",
    },
    {
        id: "pin-6",
        title: "Battle station interior lighting",
        imageUrl: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop",
        boardName: "Cockpit Design",
        link: "https://pinterest.com",
    },
] as const;

export const DEMO_BOARDS: readonly PinterestBoard[] = [
    { id: "board-1", name: "Space Command", pinCount: 142, coverImageUrl: DEMO_PINS[0].imageUrl },
    { id: "board-2", name: "90s Aesthetic", pinCount: 89, coverImageUrl: DEMO_PINS[1].imageUrl },
    { id: "board-3", name: "UI Inspiration", pinCount: 256, coverImageUrl: DEMO_PINS[2].imageUrl },
    { id: "board-4", name: "Cockpit Design", pinCount: 67, coverImageUrl: DEMO_PINS[5].imageUrl },
] as const;

const STORAGE_KEY = "master-ai-dashboard-pinterest";

export interface PinterestConnectionState {
    connected: boolean;
    username: string;
    selectedBoardId: string | null;
}

export function loadPinterestState(): PinterestConnectionState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as PinterestConnectionState;
    } catch {
        /* use defaults */
    }
    return { connected: false, username: "", selectedBoardId: null };
}

export function savePinterestState(state: PinterestConnectionState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Pinterest API v5 requires a backend OAuth proxy.
 * This helper documents the integration point for production deployment.
 */
export const PINTEREST_OAUTH_DOCS = "https://developers.pinterest.com/docs/getting-started/set-up-app/";
