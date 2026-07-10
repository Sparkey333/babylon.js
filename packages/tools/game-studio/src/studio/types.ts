export type GameId = "neon-pulse" | "orbital-forge" | "echo-realms";

export type AssetType = "mesh" | "texture" | "environment" | "audio" | "shader" | "script" | "concept" | "other";
export type AssetSource = "babylon-cdn" | "local" | "generated" | "external";

export interface StudioAsset {
    id: string;
    name: string;
    type: AssetType;
    source: AssetSource;
    url?: string;
    gameId?: GameId;
    tags: string[];
    sizeKb?: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export type AIProviderId = "openai" | "anthropic" | "ollama" | "cursor" | "local";

export interface AIProviderConfig {
    id: AIProviderId;
    name: string;
    enabled: boolean;
    apiKey: string;
    baseUrl: string;
    model: string;
    isDefault: boolean;
}

export type AgentRole = "design" | "code" | "art" | "marketing" | "qa" | "producer";

export interface StudioAgent {
    id: string;
    name: string;
    role: AgentRole;
    providerId: AIProviderId;
    systemPrompt: string;
    enabled: boolean;
    tasksCompleted: number;
    lastRunAt: string | null;
}

export interface Subscription {
    id: string;
    name: string;
    vendor: string;
    costMonthly: number;
    renewalDate: string;
    category: "ai" | "hosting" | "assets" | "tools" | "marketing";
    active: boolean;
    notes?: string;
}

export type LogLevel = "info" | "success" | "warn" | "error" | "ai";

export interface StudioLog {
    id: string;
    level: LogLevel;
    category: string;
    message: string;
    meta?: Record<string, unknown>;
    timestamp: string;
}

export interface GeneratedIdea {
    id: string;
    prompt: string;
    title: string;
    tagline: string;
    genre: string;
    hook: string;
    babylonFeatures: string[];
    monetization: string[];
    kickstarterAngle: string;
    mvpScope: string;
    marketScore: number;
    providerUsed: AIProviderId | "heuristic";
    createdAt: string;
    promotedToProject: boolean;
}

export interface GameDefinition {
    id: GameId;
    order: number;
    layer: string;
    title: string;
    tagline: string;
    version: string;
    status: "live" | "prototype" | "planned";
    controls: string;
    babylonFeatures: string[];
}

export const GAME_DEFINITIONS: GameDefinition[] = [
    {
        id: "neon-pulse",
        order: 1,
        layer: "Foundation — fastest to revenue",
        title: "Neon Pulse Arena",
        tagline: "Hyper-speed aerial score-attack roguelite",
        version: "0.1.0",
        status: "live",
        controls: "WASD / Arrows — fly, collect orbs, dodge blocks",
        babylonFeatures: ["Glow Layer", "Particles", "Follow Camera", "glTF Hero Ship"],
    },
    {
        id: "orbital-forge",
        order: 2,
        layer: "Mid-core — highest KS ceiling",
        title: "Orbital Forge",
        tagline: "Zero-G factory automation on an orbital ring",
        version: "0.1.0",
        status: "prototype",
        controls: "Click — place modules · Scroll — zoom · Drag — orbit camera",
        babylonFeatures: ["Arc Rotate Camera", "Thin Instances", "PBR Materials", "Planet Vista"],
    },
    {
        id: "echo-realms",
        order: 3,
        layer: "Expansion — co-op differentiation",
        title: "Echo Realms",
        tagline: "Co-op dimensional puzzle exploration",
        version: "0.1.0",
        status: "prototype",
        controls: "WASD — move · Q — shift dimension · E — switch character · Space — interact",
        babylonFeatures: ["Dual Character", "Physics Plates", "Dimension Post-FX", "Puzzle Gates"],
    },
];

export const BABYLON_ASSET_CATALOG: Omit<StudioAsset, "id" | "createdAt" | "updatedAt">[] = [
    {
        name: "Acrobatic Plane glTF",
        type: "mesh",
        source: "babylon-cdn",
        url: "https://assets.babylonjs.com/meshes/Demos/optimized/acrobaticPlane_variants.glb",
        gameId: "neon-pulse",
        tags: ["hero", "vehicle", "gltf"],
    },
    {
        name: "UFO glTF",
        type: "mesh",
        source: "babylon-cdn",
        url: "https://assets.babylonjs.com/meshes/ufo.glb",
        gameId: "neon-pulse",
        tags: ["vehicle", "enemy", "gltf"],
    },
    {
        name: "Environment Specular IBL",
        type: "environment",
        source: "babylon-cdn",
        url: "https://assets.babylonjs.com/environments/environmentSpecular.env",
        tags: ["lighting", "pbr", "ibl"],
    },
    {
        name: "Flare Particle Texture",
        type: "texture",
        source: "babylon-cdn",
        url: "https://assets.babylonjs.com/textures/flare.png",
        gameId: "neon-pulse",
        tags: ["vfx", "particles"],
    },
    {
        name: "Boombox glTF",
        type: "mesh",
        source: "babylon-cdn",
        url: "https://assets.babylonjs.com/meshes/boombox.glb",
        tags: ["prop", "pbr-demo"],
    },
];

export const DEFAULT_AGENTS: Omit<StudioAgent, "id" | "tasksCompleted" | "lastRunAt">[] = [
    {
        name: "Concept Forge",
        role: "design",
        providerId: "openai",
        enabled: true,
        systemPrompt: "Generate commercial game concepts optimized for Babylon.js and crowdfunding.",
    },
    {
        name: "Slice Builder",
        role: "code",
        providerId: "cursor",
        enabled: true,
        systemPrompt: "Implement vertical slice prototypes with Babylon.js ES6 modules.",
    },
    {
        name: "Trailer Director",
        role: "marketing",
        providerId: "local",
        enabled: true,
        systemPrompt: "Plan 90-second gameplay trailers and Kickstarter page structure.",
    },
    {
        name: "Asset Curator",
        role: "art",
        providerId: "ollama",
        enabled: false,
        systemPrompt: "Catalog and tag 3D assets from assets.babylonjs.com for production.",
    },
];

export const DEFAULT_SUBSCRIPTIONS: Omit<Subscription, "id">[] = [
    { name: "OpenAI API", vendor: "OpenAI", costMonthly: 20, renewalDate: "2026-08-01", category: "ai", active: false, notes: "BYOK — enable when key added" },
    { name: "Anthropic API", vendor: "Anthropic", costMonthly: 20, renewalDate: "2026-08-01", category: "ai", active: false },
    { name: "Cursor Pro", vendor: "Cursor", costMonthly: 20, renewalDate: "2026-08-15", category: "tools", active: true },
    { name: "Vercel Pro", vendor: "Vercel", costMonthly: 20, renewalDate: "2026-08-10", category: "hosting", active: true },
    { name: "itch.io Creator", vendor: "itch.io", costMonthly: 0, renewalDate: "2026-12-01", category: "marketing", active: true },
    { name: "Ollama Local", vendor: "Self-hosted", costMonthly: 0, renewalDate: "2099-01-01", category: "ai", active: true, notes: "Free local inference" },
];

export const DEFAULT_PROVIDERS: AIProviderConfig[] = [
    { id: "openai", name: "OpenAI", enabled: false, apiKey: "", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini", isDefault: true },
    { id: "anthropic", name: "Anthropic", enabled: false, apiKey: "", baseUrl: "https://api.anthropic.com/v1", model: "claude-3-5-haiku-20241022", isDefault: false },
    { id: "ollama", name: "Ollama (Local)", enabled: true, apiKey: "", baseUrl: "http://localhost:11434/v1", model: "llama3.2", isDefault: false },
    { id: "cursor", name: "Cursor Cloud Agent", enabled: true, apiKey: "", baseUrl: "", model: "agent", isDefault: false },
    { id: "local", name: "Studio Heuristic", enabled: true, apiKey: "", baseUrl: "", model: "builtin", isDefault: false },
];
