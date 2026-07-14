/**
 * Setup guide — clear steps and official URLs for keys / APIs / local Mac install.
 * Keep links as absolute https so they work in both the Vite app and static setup.html.
 */

export interface SetupLink {
    label: string;
    url: string;
    note?: string;
}

export interface SetupStep {
    id: string;
    title: string;
    body: string;
    links?: readonly SetupLink[];
    localMacOnly?: boolean;
}

export const KEY_SITES = {
    pinterestDevelopers: "https://developers.pinterest.com/",
    pinterestSetUpApp: "https://developers.pinterest.com/docs/getting-started/set-up-app/",
    pinterestAuth: "https://developers.pinterest.com/docs/getting-started/authentication/",
    pinterestApiScopes: "https://developers.pinterest.com/docs/api/v5/",
    pinterestAppsConsole: "https://developers.pinterest.com/apps/",
    babylonDocs: "https://doc.babylonjs.com/",
    babylonPlayground: "https://playground.babylonjs.com/",
    babylonMaterials: "https://doc.babylonjs.com/features/featuresDeepDive/materials/using/gridMaterial",
    fluentUi: "https://react.fluentui.dev/",
    vite: "https://vite.dev/guide/",
    electronBuilder: "https://www.electron.build/configuration/mac",
    nodeJs: "https://nodejs.org/en/download",
    githubRepo: "https://github.com/Sparkey333/babylon.js",
    openAiKeys: "https://platform.openai.com/api-keys",
    anthropicKeys: "https://console.anthropic.com/settings/keys",
    cursorAgents: "https://cursor.com/agents",
} as const;

/** Flat list for HTML / footer rendering */
export const KEY_SITE_LINKS: readonly SetupLink[] = [
    { label: "Pinterest Developers", url: KEY_SITES.pinterestDevelopers, note: "Start here for board sync" },
    { label: "Pinterest — Set up app", url: KEY_SITES.pinterestSetUpApp, note: "Create App ID + App Secret" },
    { label: "Pinterest — Authentication", url: KEY_SITES.pinterestAuth, note: "OAuth 2.0 for user boards" },
    { label: "Pinterest Apps Console", url: KEY_SITES.pinterestAppsConsole, note: "Copy App ID / Secret" },
    { label: "Pinterest API v5", url: KEY_SITES.pinterestApiScopes, note: "Pins & boards endpoints" },
    { label: "OpenAI API Keys", url: KEY_SITES.openAiKeys, note: "Optional AI co-pilot" },
    { label: "Anthropic API Keys", url: KEY_SITES.anthropicKeys, note: "Optional Claude co-pilot" },
    { label: "Node.js download", url: KEY_SITES.nodeJs, note: "LTS for local Mac" },
    { label: "Babylon.js docs", url: KEY_SITES.babylonDocs, note: "3D engine reference" },
    { label: "Electron Builder (Mac DMG)", url: KEY_SITES.electronBuilder, note: "Local .app / .dmg packaging" },
    { label: "Repo (Sparkey333)", url: "https://github.com/Sparkey333/babylon.js", note: "Source + PR" },
];

export const SETUP_STEPS: readonly SetupStep[] = [
    {
        id: "mac-prerequisite",
        title: "1. Local Mac prerequisites",
        body: "Install Node.js LTS (20.x) and clone/open this repo on your Mac. This dashboard is configured for local Mac first — skip cloud deploy for now.",
        localMacOnly: true,
        links: [
            { label: "Download Node.js LTS", url: KEY_SITES.nodeJs },
            { label: "Open repo on GitHub", url: "https://github.com/Sparkey333/babylon.js" },
        ],
    },
    {
        id: "run-dev",
        title: "2. Run the Command Center locally",
        body: "From the repo root: npm install → npm run build:dev → npm run serve -w @tools/master-ai-dashboard. Open http://localhost:1347",
        localMacOnly: true,
        links: [{ label: "Vite guide", url: KEY_SITES.vite }],
    },
    {
        id: "pinterest-app",
        title: "3. Create a Pinterest app (get keys)",
        body: "Create a Pinterest developer app, then copy App ID and App Secret. Add a redirect URI you control on Mac (e.g. http://localhost:1347/oauth/pinterest/callback). Store secrets in a local .env — never commit them.",
        links: [
            { label: "Pinterest Developers home", url: KEY_SITES.pinterestDevelopers },
            { label: "Set up your app (official)", url: KEY_SITES.pinterestSetUpApp },
            { label: "Apps console (keys)", url: KEY_SITES.pinterestAppsConsole },
        ],
    },
    {
        id: "pinterest-oauth",
        title: "4. Connect OAuth → boards & pins",
        body: "Follow Pinterest Authentication docs. You need scopes for boards/pins. Wire a tiny local proxy on Mac that holds App Secret and exchanges the code for a token. Point the Inspiration pane at that proxy.",
        links: [
            { label: "Authentication docs", url: KEY_SITES.pinterestAuth },
            { label: "API v5 reference", url: KEY_SITES.pinterestApiScopes },
        ],
    },
    {
        id: "optional-ai",
        title: "5. Optional — AI co-pilot keys",
        body: "If you add an AI chat panel later, create keys on OpenAI and/or Anthropic. Keep keys in Keychain or a local .env on this Mac only.",
        links: [
            { label: "OpenAI API keys", url: KEY_SITES.openAiKeys },
            { label: "Anthropic API keys", url: KEY_SITES.anthropicKeys },
        ],
    },
    {
        id: "mac-dmg",
        title: "6. Package & open a fresh Mac DMG",
        body: "On this Mac: npm run package:mac -w @tools/master-ai-dashboard. When the build finishes, refresh Finder and open the new .dmg under packages/tools/master-ai-dashboard/release/. Drag Master AI Command Center into Applications, then launch.",
        localMacOnly: true,
        links: [
            { label: "Electron Builder Mac / DMG docs", url: KEY_SITES.electronBuilder },
            { label: "Standalone setup page (in app)", url: "./setup.html" },
        ],
    },
    {
        id: "verify",
        title: "7. Verify the cockpit",
        body: "Drag in the 3D viewport to look around. Open Command Center (left), Inspiration / Pinterest (right), Debug Bay, and this Setup guide. Confirm zone stations light up when you select projects.",
        links: [
            { label: "Babylon.js docs", url: KEY_SITES.babylonDocs },
            { label: "Playground (3D experiments)", url: KEY_SITES.babylonPlayground },
        ],
    },
] as const;

export const LOCAL_ENV_TEMPLATE = `# Copy to packages/tools/master-ai-dashboard/.env.local (Mac only — gitignored)
# Get values from the Key Sites links in Setup.

PINTEREST_APP_ID=
PINTEREST_APP_SECRET=
PINTEREST_REDIRECT_URI=http://localhost:1347/oauth/pinterest/callback

# Optional AI (never commit)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Dev server
MASTER_AI_DASHBOARD_PORT=1347
`;
