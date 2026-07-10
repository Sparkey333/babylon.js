import { useEffect, useRef } from "react";
import { createCockpitScene, type CockpitScene } from "../cockpitScene";
import { type CockpitSceneApi } from "../types";
import styles from "./cockpitViewport.module.scss";

export interface CockpitViewportProps {
    onSceneReady: (api: CockpitSceneApi) => void;
}

export function CockpitViewport({ onSceneReady }: CockpitViewportProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<CockpitScene | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const scene = createCockpitScene(canvas);
        sceneRef.current = scene;
        onSceneReady(scene);

        return () => {
            scene.dispose();
            sceneRef.current = null;
        };
    }, [onSceneReady]);

    return (
        <div className={styles.viewport}>
            <canvas ref={canvasRef} className={styles.canvas} />
            <div className={styles.scanlines} aria-hidden="true" />
            <div className={styles.hudFrame}>
                <div className={styles.hudCorner} data-pos="tl" />
                <div className={styles.hudCorner} data-pos="tr" />
                <div className={styles.hudCorner} data-pos="bl" />
                <div className={styles.hudCorner} data-pos="br" />
                <div className={styles.hudTitle}>MASTER COMMAND · GRAYSKULL STATION</div>
                <div className={styles.hudHint}>DRAG TO LOOK AROUND · SCROLL TO ZOOM</div>
            </div>
        </div>
    );
}
