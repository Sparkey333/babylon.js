export type TaskStatus = "backlog" | "in_progress" | "review" | "done" | "blocked";

export type TaskCategory =
    | "design"
    | "engineering"
    | "art"
    | "audio"
    | "marketing"
    | "business"
    | "qa"
    | "community";

export interface ProjectTask {
    id: string;
    title: string;
    description: string;
    category: TaskCategory;
    status: TaskStatus;
    phaseId: string;
    priority: "critical" | "high" | "medium" | "low";
    revenueImpact: number;
    hoursEstimate: number;
    autoUnlock?: string[];
    autoCompleteWhen?: string[];
}

export interface ProjectPhase {
    id: string;
    name: string;
    goal: string;
    targetRevenue: number;
    order: number;
}

export interface RevenueMilestone {
    id: string;
    label: string;
    amount: number;
    channel: string;
    achieved: boolean;
}

export interface GameConceptId {
    id: "orbital-forge" | "neon-pulse" | "echo-realms";
}

export interface ProjectSnapshot {
    selectedConcept: GameConceptId["id"];
    phases: ProjectPhase[];
    tasks: ProjectTask[];
    revenueMilestones: RevenueMilestone[];
    totalRevenue: number;
    autopilotEnabled: boolean;
    lastAutopilotRun: string | null;
    kickstarterReadyScore: number;
}

export const PHASES: ProjectPhase[] = [
    { id: "pre", name: "Pre-Production", goal: "Validate concept, core loop, market fit", targetRevenue: 0, order: 0 },
    { id: "slice", name: "Vertical Slice", goal: "Playable demo that sells the fantasy", targetRevenue: 0, order: 1 },
    { id: "alpha", name: "Alpha", goal: "Content-complete core systems", targetRevenue: 0, order: 2 },
    { id: "beta", name: "Beta", goal: "Polish, balance, platform builds", targetRevenue: 0, order: 3 },
    { id: "launch", name: "Launch", goal: "Ship + day-one monetization live", targetRevenue: 5000, order: 4 },
    { id: "scale", name: "Scale", goal: "DLC, live ops, porting", targetRevenue: 50000, order: 5 },
];

export const INITIAL_TASKS: ProjectTask[] = [
    {
        id: "t1",
        title: "Lock hero fantasy & elevator pitch",
        description: "One sentence hook + 30s gameplay promise for crowdfunding page.",
        category: "design",
        status: "done",
        phaseId: "pre",
        priority: "critical",
        revenueImpact: 2,
        hoursEstimate: 4,
    },
    {
        id: "t2",
        title: "Ship Babylon vertical slice (Neon Pulse Arena)",
        description: "Playable browser demo with score loop, VFX, and hero asset.",
        category: "engineering",
        status: "done",
        phaseId: "slice",
        priority: "critical",
        revenueImpact: 5,
        hoursEstimate: 16,
    },
    {
        id: "t3",
        title: "Record 90s gameplay trailer",
        description: "Capture 4K footage from vertical slice for Kickstarter hero video.",
        category: "marketing",
        status: "in_progress",
        phaseId: "slice",
        priority: "critical",
        revenueImpact: 8,
        hoursEstimate: 8,
        autoUnlock: ["t2"],
    },
    {
        id: "t4",
        title: "Steam Coming Soon page draft",
        description: "Capsule art, tags, short description, wishlist CTA.",
        category: "marketing",
        status: "backlog",
        phaseId: "slice",
        priority: "high",
        revenueImpact: 6,
        hoursEstimate: 6,
        autoUnlock: ["t3"],
    },
    {
        id: "t5",
        title: "Kickstarter page wireframe",
        description: "Tiers, stretch goals, budget breakdown, team bios.",
        category: "business",
        status: "backlog",
        phaseId: "slice",
        priority: "high",
        revenueImpact: 9,
        hoursEstimate: 12,
        autoUnlock: ["t3"],
    },
    {
        id: "t6",
        title: "Discord community server setup",
        description: "Channels, roles, playtest signup bot, announcement webhooks.",
        category: "community",
        status: "backlog",
        phaseId: "alpha",
        priority: "medium",
        revenueImpact: 4,
        hoursEstimate: 4,
    },
    {
        id: "t7",
        title: "Havok physics combat prototype",
        description: "Destructible props + knockback for premium feel.",
        category: "engineering",
        status: "backlog",
        phaseId: "alpha",
        priority: "high",
        revenueImpact: 5,
        hoursEstimate: 24,
    },
    {
        id: "t8",
        title: "Original soundtrack loop (menu + combat)",
        description: "License or commission 2 tracks for demo and trailer.",
        category: "audio",
        status: "backlog",
        phaseId: "alpha",
        priority: "medium",
        revenueImpact: 3,
        hoursEstimate: 20,
    },
    {
        id: "t9",
        title: "Playtest survey (10 external players)",
        description: "Google Form: fun factor, clarity, willingness to pay.",
        category: "qa",
        status: "backlog",
        phaseId: "beta",
        priority: "high",
        revenueImpact: 7,
        hoursEstimate: 10,
        autoUnlock: ["t4"],
    },
    {
        id: "t10",
        title: "Launch day monetization: premium + cosmetic DLC",
        description: "Stripe/itch.io/Steam pricing strategy and SKU setup.",
        category: "business",
        status: "backlog",
        phaseId: "launch",
        priority: "critical",
        revenueImpact: 10,
        hoursEstimate: 16,
    },
    {
        id: "t11",
        title: "Press kit & influencer outreach list",
        description: "50 contacts, embargo assets, review keys pipeline.",
        category: "marketing",
        status: "backlog",
        phaseId: "launch",
        priority: "high",
        revenueImpact: 8,
        hoursEstimate: 12,
    },
    {
        id: "t12",
        title: "Post-launch analytics dashboard",
        description: "Retention, ARPU, funnel from demo → purchase.",
        category: "engineering",
        status: "backlog",
        phaseId: "scale",
        priority: "medium",
        revenueImpact: 6,
        hoursEstimate: 20,
    },
];

export const REVENUE_MILESTONES: RevenueMilestone[] = [
    { id: "r1", label: "First wishlist (Steam / itch)", amount: 0, channel: "Wishlist", achieved: false },
    { id: "r2", label: "First $1 (any channel)", amount: 1, channel: "Direct", achieved: false },
    { id: "r3", label: "First $100 (demo tips / early access)", amount: 100, channel: "Early Access", achieved: false },
    { id: "r4", label: "Kickstarter funding goal", amount: 25000, channel: "Crowdfunding", achieved: false },
    { id: "r5", label: "Launch week revenue", amount: 5000, channel: "Launch", achieved: false },
];

export const KICKSTARTER_CHECKLIST = [
    { id: "k1", label: "90-second gameplay trailer", weight: 15 },
    { id: "k2", label: "Playable demo link (browser build)", weight: 20 },
    { id: "k3", label: "Transparent budget breakdown", weight: 10 },
    { id: "k4", label: "Team credibility section", weight: 10 },
    { id: "k5", label: "Reward tiers with clear deliverables", weight: 15 },
    { id: "k6", label: "Social proof (Discord count, press quotes)", weight: 10 },
    { id: "k7", label: "Risk & challenges section", weight: 5 },
    { id: "k8", label: "Post-campaign delivery timeline", weight: 10 },
    { id: "k9", label: "Email capture landing page", weight: 5 },
    { id: "k10", label: "Day-1 backer communication plan", weight: 10 },
];
