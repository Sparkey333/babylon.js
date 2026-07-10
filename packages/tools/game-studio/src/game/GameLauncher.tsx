import { useEffect, useRef, useState, useCallback } from "react";
import { ArenaGame } from "./ArenaGame";
import { ForgeGame, type ForgeStats } from "./forge/ForgeGame";
import { EchoGame, type EchoStats } from "./echo/EchoGame";
import { GAME_DEFINITIONS, type GameId } from "../studio/types";
import { useStudioStore } from "../studio/store";

type GamePhase = "menu" | "playing" | "paused" | "gameover" | "won";

interface GameInstance {
    dispose: () => void;
}

export function GameLauncher() {
    const activeGameId = useStudioStore((s) => s.activeGameId);
    const setActiveGame = useStudioStore((s) => s.setActiveGame);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<GameInstance | null>(null);

    const [phase, setPhase] = useState<GamePhase>("menu");
    const [neonStats, setNeonStats] = useState<{ score: number; combo: number; orbsCollected: number; highScore: number } | null>(null);
    const [forgeStats, setForgeStats] = useState<ForgeStats | null>(null);
    const [echoStats, setEchoStats] = useState<EchoStats | null>(null);

    const gameDef = GAME_DEFINITIONS.find((g) => g.id === activeGameId)!;

    const disposeGame = useCallback(() => {
        gameRef.current?.dispose();
        gameRef.current = null;
    }, []);

    const initGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        disposeGame();
        setPhase("menu");

        if (activeGameId === "neon-pulse") {
            const game = new ArenaGame(canvas, {
                onStats: (s) => setNeonStats({ score: s.score, combo: s.combo, orbsCollected: s.orbsCollected, highScore: s.highScore }),
                onPhase: (p) => setPhase(p as GamePhase),
            });
            gameRef.current = game;
        } else if (activeGameId === "orbital-forge") {
            const game = new ForgeGame(canvas, { onStats: setForgeStats });
            gameRef.current = game;
        } else {
            const game = new EchoGame(canvas, {
                onStats: setEchoStats,
                onWin: () => setPhase("won"),
            });
            gameRef.current = game;
        }
    }, [activeGameId, disposeGame]);

    useEffect(() => {
        initGame();
        return disposeGame;
    }, [initGame, disposeGame]);

    const startNeon = () => (gameRef.current as ArenaGame)?.startGame();
    const pauseNeon = () => (gameRef.current as ArenaGame)?.pauseGame();
    const resumeNeon = () => (gameRef.current as ArenaGame)?.resumeGame();

    const selectGame = (id: GameId) => {
        if (id !== activeGameId) {
            setActiveGame(id);
        }
    };

    const sortedGames = [...GAME_DEFINITIONS].sort((a, b) => a.order - b.order);

    return (
        <div className="game-view">
            <div className="game-selector">
                {sortedGames.map((g) => (
                    <button
                        key={g.id}
                        type="button"
                        className={activeGameId === g.id ? "game-card active" : "game-card"}
                        onClick={() => selectGame(g.id)}
                    >
                        <span className="game-order">Layer {g.order}</span>
                        <strong>{g.title}</strong>
                        <small>{g.layer}</small>
                        <span className={`status-badge ${g.status}`}>{g.status}</span>
                    </button>
                ))}
            </div>

            <div className="game-view-inner">
            <div className="game-canvas-wrap">
                <canvas ref={canvasRef} className="game-canvas" />
                <div className="game-hud">
                    <div className="hud-top">
                        <span className="hud-title">{gameDef.title}</span>
                        <span className="hud-version">v{gameDef.version}</span>
                    </div>

                    {activeGameId === "neon-pulse" && neonStats && (
                        <div className="hud-stats">
                            <div className="stat"><label>Score</label><strong>{neonStats.score.toLocaleString()}</strong></div>
                            <div className="stat"><label>Combo</label><strong>x{neonStats.combo}</strong></div>
                            <div className="stat"><label>Orbs</label><strong>{neonStats.orbsCollected}</strong></div>
                            <div className="stat"><label>Best</label><strong>{neonStats.highScore.toLocaleString()}</strong></div>
                        </div>
                    )}
                    {activeGameId === "orbital-forge" && forgeStats && (
                        <div className="hud-stats">
                            <div className="stat"><label>Modules</label><strong>{forgeStats.modules}</strong></div>
                            <div className="stat"><label>Prod/s</label><strong>{forgeStats.production}</strong></div>
                            <div className="stat"><label>Ore</label><strong>{forgeStats.oreStored}</strong></div>
                        </div>
                    )}
                    {activeGameId === "echo-realms" && echoStats && (
                        <div className="hud-stats">
                            <div className="stat"><label>Player</label><strong>P{echoStats.activePlayer}</strong></div>
                            <div className="stat"><label>Dimension</label><strong>{echoStats.dimension}</strong></div>
                            <div className="stat"><label>Solved</label><strong>{echoStats.puzzlesSolved}</strong></div>
                        </div>
                    )}
                </div>

                {activeGameId === "neon-pulse" && phase === "menu" && (
                    <div className="game-overlay">
                        <h2>{gameDef.title}</h2>
                        <p>{gameDef.tagline}</p>
                        <p className="controls-hint">{gameDef.controls}</p>
                        <button type="button" className="btn-primary" onClick={startNeon}>Launch</button>
                    </div>
                )}
                {activeGameId === "neon-pulse" && phase === "paused" && (
                    <div className="game-overlay">
                        <h2>Paused</h2>
                        <button type="button" className="btn-primary" onClick={resumeNeon}>Resume</button>
                    </div>
                )}
                {activeGameId === "neon-pulse" && phase === "gameover" && (
                    <div className="game-overlay">
                        <h2>Mission Failed</h2>
                        <p>Score: {neonStats?.score.toLocaleString()}</p>
                        <button type="button" className="btn-primary" onClick={startNeon}>Retry</button>
                    </div>
                )}
                {activeGameId === "neon-pulse" && phase === "playing" && (
                    <button type="button" className="pause-btn" onClick={pauseNeon} aria-label="Pause">⏸</button>
                )}

                {activeGameId === "orbital-forge" && (
                    <div className="game-overlay subtle">
                        <p className="controls-hint">{gameDef.controls}</p>
                    </div>
                )}

                {activeGameId === "echo-realms" && phase !== "won" && (
                    <div className="game-overlay subtle">
                        <p className="controls-hint">{gameDef.controls}</p>
                        <p className="controls-hint">Both players on plates to open the gate</p>
                    </div>
                )}
                {activeGameId === "echo-realms" && phase === "won" && (
                    <div className="game-overlay">
                        <h2>Gate Opened!</h2>
                        <p>Co-op puzzle complete — dimensional shift successful.</p>
                    </div>
                )}
            </div>

            <aside className="game-sidebar">
                <h3>{gameDef.title}</h3>
                <p className="sidebar-tagline">{gameDef.tagline}</p>
                <h4>Babylon Features</h4>
                <ul>{gameDef.babylonFeatures.map((f) => <li key={f}>{f}</li>)}</ul>
                <h4>Ship Strategy</h4>
                <ul>
                    {activeGameId === "neon-pulse" && (
                        <>
                            <li>Fastest path to trailer + itch.io demo</li>
                            <li>Record score runs for social clips</li>
                        </>
                    )}
                    {activeGameId === "orbital-forge" && (
                        <>
                            <li>Highest Kickstarter ceiling ($180K target)</li>
                            <li>Scale to Havok + thin instances in alpha</li>
                        </>
                    )}
                    {activeGameId === "echo-realms" && (
                        <>
                            <li>Co-op link sharing = viral growth</li>
                            <li>Add WebRTC multiplayer in alpha</li>
                        </>
                    )}
                </ul>
            </aside>
            </div>
        </div>
    );
}
