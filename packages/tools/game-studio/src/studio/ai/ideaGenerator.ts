import type { AIProviderConfig, AIProviderId, GeneratedIdea } from "../types";
import { studioLog } from "../logger";

const GENRE_POOL = ["Roguelite", "Factory Sim", "Co-op Puzzle", "Tactical RPG", "Survival Horror", "Racing", "Tower Defense"];
const FEATURE_POOL = ["Havok Physics", "Thin Instances", "Node Materials", "Flow Graph", "Audio V2", "Glow Layer", "GUI Editor", "Atmosphere Addon", "Post Processes", "Serializers"];

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function extractKeywords(prompt: string): string[] {
    return prompt
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !["with", "that", "game", "make", "build", "create", "from"].includes(w))
        .slice(0, 5);
}

function heuristicIdea(prompt: string): Omit<GeneratedIdea, "id" | "createdAt" | "providerUsed" | "promotedToProject"> {
    const keywords = extractKeywords(prompt);
    const theme = keywords[0] ?? "neon";
    const mechanic = keywords[1] ?? "survival";
    const title = `${theme.charAt(0).toUpperCase() + theme.slice(1)} ${mechanic.charAt(0).toUpperCase() + mechanic.slice(1)} Protocol`;
    const genre = pick(GENRE_POOL);
    const features = [...new Set([pick(FEATURE_POOL), pick(FEATURE_POOL), pick(FEATURE_POOL)])];

    return {
        prompt,
        title,
        tagline: `A ${genre.toLowerCase()} where ${mechanic} meets ${theme} — built for browser-first launch`,
        genre,
        hook: `Players master ${mechanic} systems in a ${theme}-soaked world with instant shareable demo links.`,
        babylonFeatures: features,
        monetization: ["Premium $14.99–$24.99", "Cosmetic DLC", "Early access founder pack"],
        kickstarterAngle: `Lead with a 90s browser demo showing ${mechanic} depth — zero download friction converts cold traffic.`,
        mvpScope: "4–6 week vertical slice: one biome, one core loop, one trailer moment",
        marketScore: 65 + Math.floor(Math.random() * 25),
    };
}

async function callOpenAI(provider: AIProviderConfig, prompt: string): Promise<string> {
    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
            model: provider.model,
            messages: [
                {
                    role: "system",
                    content:
                        "You are a commercial game designer specializing in Babylon.js web games and Kickstarter launches. Respond ONLY with valid JSON matching: {title, tagline, genre, hook, babylonFeatures[], monetization[], kickstarterAngle, mvpScope, marketScore}",
                },
                { role: "user", content: `Generate a game concept for: ${prompt}` },
            ],
            temperature: 0.8,
        }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    return data.choices[0].message.content;
}

async function callAnthropic(provider: AIProviderConfig, prompt: string): Promise<string> {
    const res = await fetch(`${provider.baseUrl}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": provider.apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: provider.model,
            max_tokens: 1024,
            system:
                "You are a commercial game designer for Babylon.js. Respond ONLY with valid JSON: {title, tagline, genre, hook, babylonFeatures[], monetization[], kickstarterAngle, mvpScope, marketScore}",
            messages: [{ role: "user", content: `Generate a game concept for: ${prompt}` }],
        }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { content: { text: string }[] };
    return data.content[0].text;
}

async function callOllama(provider: AIProviderConfig, prompt: string): Promise<string> {
    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: provider.model,
            messages: [
                {
                    role: "system",
                    content:
                        "Respond ONLY with JSON: {title, tagline, genre, hook, babylonFeatures[], monetization[], kickstarterAngle, mvpScope, marketScore}",
                },
                { role: "user", content: prompt },
            ],
            stream: false,
        }),
    });
    if (!res.ok) throw new Error(`Ollama ${res.status} — is Ollama running at ${provider.baseUrl}?`);
    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    return data.choices[0].message.content;
}

function parseAIJson(raw: string): Omit<GeneratedIdea, "id" | "createdAt" | "providerUsed" | "promotedToProject" | "prompt"> {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in AI response");
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    return {
        title: String(parsed.title ?? "Untitled"),
        tagline: String(parsed.tagline ?? ""),
        genre: String(parsed.genre ?? "Action"),
        hook: String(parsed.hook ?? ""),
        babylonFeatures: Array.isArray(parsed.babylonFeatures) ? parsed.babylonFeatures.map(String) : [],
        monetization: Array.isArray(parsed.monetization) ? parsed.monetization.map(String) : [],
        kickstarterAngle: String(parsed.kickstarterAngle ?? ""),
        mvpScope: String(parsed.mvpScope ?? ""),
        marketScore: Number(parsed.marketScore) || 70,
    };
}

export async function generateGameIdea(
    prompt: string,
    providers: AIProviderConfig[]
): Promise<GeneratedIdea> {
    const defaultProvider = providers.find((p) => p.isDefault && p.enabled && (p.id === "local" || p.apiKey || p.id === "ollama"));
    const active = defaultProvider ?? providers.find((p) => p.enabled && (p.apiKey || p.id === "ollama" || p.id === "local"));

    studioLog("ai", "idea-lab", `Generating idea: "${prompt.slice(0, 80)}..."`, { provider: active?.id ?? "heuristic" });

    if (!active || active.id === "local" || active.id === "cursor") {
        const idea = heuristicIdea(prompt);
        studioLog("info", "idea-lab", `Heuristic concept generated: ${idea.title}`);
        return {
            ...idea,
            id: `idea-${Date.now()}`,
            createdAt: new Date().toISOString(),
            providerUsed: "local",
            promotedToProject: false,
        };
    }

    try {
        let raw: string;
        if (active.id === "openai") raw = await callOpenAI(active, prompt);
        else if (active.id === "anthropic") raw = await callAnthropic(active, prompt);
        else if (active.id === "ollama") raw = await callOllama(active, prompt);
        else throw new Error("Unknown provider");

        const parsed = parseAIJson(raw);
        studioLog("success", "idea-lab", `AI concept generated: ${parsed.title}`, { provider: active.id });
        return {
            ...parsed,
            prompt,
            id: `idea-${Date.now()}`,
            createdAt: new Date().toISOString(),
            providerUsed: active.id as AIProviderId,
            promotedToProject: false,
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        studioLog("warn", "idea-lab", `AI failed, falling back to heuristic: ${msg}`);
        const idea = heuristicIdea(prompt);
        return {
            ...idea,
            id: `idea-${Date.now()}`,
            createdAt: new Date().toISOString(),
            providerUsed: "local",
            promotedToProject: false,
        };
    }
}

export async function runAgentTask(
    agentName: string,
    task: string,
    provider: AIProviderConfig
): Promise<string> {
    studioLog("ai", "agent", `${agentName} started: ${task.slice(0, 60)}`);
    if (provider.id === "local" || !provider.apiKey) {
        const result = `[Heuristic] ${agentName} suggests: Break "${task}" into 3 deliverables — vertical slice, trailer capture, landing page.`;
        studioLog("success", "agent", `${agentName} completed (heuristic)`);
        return result;
    }
    try {
        const res = await fetch(`${provider.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${provider.apiKey}`,
            },
            body: JSON.stringify({
                model: provider.model,
                messages: [
                    { role: "system", content: `You are ${agentName}, a game development agent.` },
                    { role: "user", content: task },
                ],
            }),
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const data = (await res.json()) as { choices: { message: { content: string } }[] };
        const result = data.choices[0].message.content;
        studioLog("success", "agent", `${agentName} completed`);
        return result;
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        studioLog("error", "agent", `${agentName} failed: ${msg}`);
        return `[Error] ${msg}`;
    }
}
