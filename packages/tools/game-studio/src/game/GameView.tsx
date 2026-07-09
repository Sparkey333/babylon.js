import { useEffect, useRef, useState, useCallback } from "react";
import { ArenaGame } from "./ArenaGame";
import { GAME_CONFIG } from "./config";
import type { GamePhase, GameStats } from "./GameState";

export function GameView() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<ArenaGame | null>(null);
    const [phase, setPhase] = useState<GamePhase>("menu");
    const [stats, setStats] = useState<GameStats | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const game = new ArenaGame(canvas, {
            onStats: setStats,
            onPhase: setPhase,
        });
        gameRef.current = game;

        return () => {
            game.dispose();
            gameRef.current = null;
        };
    }, []);

    const start = useCallback(() => gameRef.current?.startGame(), []);
    const pause = useCallback(() => gameRef.current?.pauseGame(), []);
    const resume = useCallback(() => gameRef.current?.resumeGame(), []);

    return (
        <div className="game-view">
            <div className="game-canvas-wrap">
                <canvas ref={canvasRef} className="game-canvas" />
                <div className="game-hud">
                    <div className="hud-top">
                        <span className="hud-title">{GAME_CONFIG.title}</span>
                        <span className="hud-version">v{GAME_CONFIG.version}</span>
                    </div>
                    {stats && (
                        <div className="hud-stats">
                            <div className="stat">
                                <label>Score</label>
                                <strong>{stats.score.toLocaleString()}</strong>
                            </div>
                            <div className="stat">
                                <label>Combo</label>
                                <strong>x{stats.combo}</strong>
                            </div>
                            <div className="stat">
                                <label>Orbs</label>
                                <strong>{stats.orbsCollected}</strong>
                            </div>
                            <div className="stat">
                                <label>Best</label>
                                <strong>{stats.highScore.toLocaleString()}</strong>
                            </div>
                        </div>
                    )}
                </div>

                {phase === "menu" && (
                    <div className="game-overlay">
                        <h2>{GAME_CONFIG.title}</h2>
                        <p>{GAME_CONFIG.tagline}</p>
                        <p className="controls-hint">WASD / Arrows — fly · Collect cyan orbs · Dodge red blocks</p>
                        <button type="button" className="btn-primary" onClick={start}>
                            Launch Vertical Slice
                        </button>
                    </div>
                )}

                {phase === "paused" && (
                    <div className="game-overlay">
                        <h2>Paused</h2>
                        <button type="button" className="btn-primary" onClick={resume}>
                            Resume
                        </button>
                    </div>
                )}

                {phase === "gameover" && (
                    <div className="game-overlay">
                        <h2>Mission Failed</h2>
                        <p>Final score: {stats?.score.toLocaleString()}</p>
                        <button type="button" className="btn-primary" onClick={start}>
                            Retry Run
                        </button>
                    </div>
                )}

                {phase === "playing" && (
                    <button type="button" className="pause-btn" onClick={pause} aria-label="Pause">
                        ⏸
                    </button>
                )}
            </div>
            <aside className="game-sidebar">
                <h3>Vertical Slice Goals</h3>
                <ul>
                    <li>Prove core loop in under 60 seconds of play</li>
                    <li>Showcase PBR + glow + particles + glTF hero asset</li>
                    <li>Record gameplay for Kickstarter / Steam page</li>
                    <li>Validate feel before art budget scales</li>
                </ul>
                <h3>Babylon Assets In Use</h3>
                <ul className="asset-list">
                    <li>Acrobatic plane glTF (hero ship)</li>
                    <li>environmentSpecular.env (IBL lighting)</li>
                    <li>San Giuseppe bridge sky (optional upgrade)</li>
                    <li>Flare particle texture</li>
                </ul>
            </aside>
        </div>
    );
}
