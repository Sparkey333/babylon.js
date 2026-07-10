export interface GameConcept {
    id: "orbital-forge" | "neon-pulse" | "echo-realms";
    name: string;
    tagline: string;
    genre: string;
    platforms: string[];
    monetization: string[];
    kickstarterGoal: number;
    marketScore: number;
    babylonStrength: number;
    assetHighlights: string[];
    babylonFeatures: string[];
    competitiveEdge: string;
    revenueModel: string;
    demoScopeWeeks: string;
    crowdAppeal: string;
}

export const GAME_CONCEPTS: GameConcept[] = [
    {
        id: "orbital-forge",
        name: "Orbital Forge",
        tagline: "Build dyson-ring factories in zero-G — Factorio meets Satisfactory in orbit",
        genre: "3D Factory / Automation / Survival",
        platforms: ["Web (Babylon)", "Steam (Electron/Tauri)", "Xbox Cloud"],
        monetization: ["Premium $24.99", "Blueprint DLC packs", "Cosmetic station skins"],
        kickstarterGoal: 180000,
        marketScore: 92,
        babylonStrength: 95,
        assetHighlights: [
            "PBR material library + Node Material Editor for sci-fi panels",
            "Havok physics for conveyor + debris simulation",
            "Thin instances for millions of factory modules",
            "Atmosphere addon for planetary vistas from orbit",
            "Flow Graph for visual scripting automation logic",
        ],
        babylonFeatures: ["Havok", "Node Materials", "Thin Instances", "Atmosphere Addon", "Flow Graph"],
        competitiveEdge:
            "Browser-first factory game with instant demo share links — no 30GB download barrier. Kickstarter loves visible automation porn in trailers.",
        revenueModel: "Premium base game + quarterly blueprint packs ($4.99) + soundtrack/OST bundle",
        demoScopeWeeks: "6–8 weeks to vertical slice (one orbital ring sector)",
        crowdAppeal: "Extremely high — factory/automation is a proven Kickstarter genre with passionate backers",
    },
    {
        id: "neon-pulse",
        name: "Neon Pulse Arena",
        tagline: "Hyper-speed aerial arena combat — score attack roguelite with modular ships",
        genre: "Arcade Shooter / Roguelite / Score Attack",
        platforms: ["Web arcade", "Steam", "Nintendo Switch (via port)"],
        monetization: ["Free demo + $14.99 premium", "Ship skin battle pass", "Tournament entry fees"],
        kickstarterGoal: 75000,
        marketScore: 88,
        babylonStrength: 90,
        assetHighlights: [
            "Acrobatic plane / UFO glTF hero ships (assets.babylonjs.com)",
            "Glow layer + particle systems for neon VFX",
            "Post-process bloom + chromatic aberration",
            "GUI editor for HUD / upgrade screens",
            "Procedural arena generation with MeshBuilder",
        ],
        babylonFeatures: ["Glow Layer", "Particles", "Post Processes", "GUI Editor", "glTF Pipeline"],
        competitiveEdge:
            "Shippable in weeks, not years. Perfect for viral 'one more run' loops. Browser demo = frictionless Kickstarter conversion.",
        revenueModel: "Demo on web → Steam premium unlock. Cosmetic DLC ships monthly.",
        demoScopeWeeks: "2–3 weeks (current vertical slice is foundation)",
        crowdAppeal: "High — arcade score games have low scope risk and great trailer moments",
    },
    {
        id: "echo-realms",
        name: "Echo Realms",
        tagline: "Co-op puzzle exploration in shifting dimensional ruins — Portal meets It Takes Two",
        genre: "Co-op Puzzle Adventure / Narrative",
        platforms: ["Web co-op", "Steam", "GeForce NOW"],
        monetization: ["Premium $19.99", "Season pass story chapters", "Soundtrack + art book"],
        kickstarterGoal: 120000,
        marketScore: 85,
        babylonStrength: 88,
        assetHighlights: [
            "PBR environment maps + reflection probes for ruins",
            "Physics joints + ragdolls for interactive puzzles",
            "Audio engine V2 spatial audio for dimensional shifts",
            "Animation retargeting for character variety",
            "Scene serializer for user-generated puzzle rooms",
        ],
        babylonFeatures: ["Physics", "Audio V2", "Reflection Probes", "Animation", "Serializers"],
        competitiveEdge:
            "Co-op browser games are rare — instant 'send link to friend' multiplayer is a marketing superpower.",
        revenueModel: "Premium + episodic story DLC. UGC puzzle workshop as long-tail retention.",
        demoScopeWeeks: "8–10 weeks for 2-player 30-minute co-op chapter",
        crowdAppeal: "Strong — co-op puzzle adventures consistently fund when demo shows unique mechanic",
    },
];

export function getConceptById(id: GameConcept["id"]): GameConcept {
    return GAME_CONCEPTS.find((c) => c.id === id) ?? GAME_CONCEPTS[1];
}
