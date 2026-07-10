import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import "@babylonjs/core/Helpers/sceneHelpers";

export interface EchoStats {
    puzzlesSolved: number;
    dimension: "alpha" | "beta";
    activePlayer: 1 | 2;
}

export interface EchoCallbacks {
    onStats: (stats: EchoStats) => void;
    onWin: () => void;
}

export class EchoGame {
    private engine: Engine;
    private scene: Scene;
    private callbacks: EchoCallbacks;
    private stats: EchoStats = { puzzlesSolved: 0, dimension: "alpha", activePlayer: 1 };
    private player1!: Mesh;
    private player2!: Mesh;
    private plate1!: Mesh;
    private plate2!: Mesh;
    private gate!: Mesh;
    private keys = new Set<string>();
    private plate1Active = false;
    private plate2Active = false;
    private disposed = false;
    private boundDown: (e: KeyboardEvent) => void;
    private boundUp: (e: KeyboardEvent) => void;

    constructor(canvas: HTMLCanvasElement, callbacks: EchoCallbacks) {
        this.callbacks = callbacks;
        this.engine = new Engine(canvas, true, { adaptToDeviceRatio: true });
        this.scene = new Scene(this.engine);
        this.boundDown = (e) => this.onKey(e, true);
        this.boundUp = (e) => this.onKey(e, false);
        this.build();
    }

    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        window.removeEventListener("keydown", this.boundDown);
        window.removeEventListener("keyup", this.boundUp);
        this.scene.dispose();
        this.engine.dispose();
    }

    private onKey(e: KeyboardEvent, down: boolean): void {
        if (down) {
            this.keys.add(e.code);
            if (e.code === "KeyE") this.switchPlayer();
            if (e.code === "KeyQ") this.shiftDimension();
        } else {
            this.keys.delete(e.code);
        }
    }

    private build(): void {
        new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        const camera = new UniversalCamera("cam", new Vector3(0, 12, -16), this.scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(this.engine.getRenderingCanvas(), true);
        this.scene.activeCamera = camera;

        const floor = MeshBuilder.CreateGround("floor", { width: 24, height: 24 }, this.scene);
        const floorMat = new StandardMaterial("floorMat", this.scene);
        floorMat.diffuseColor = new Color3(0.12, 0.1, 0.18);
        floor.material = floorMat;

        this.player1 = MeshBuilder.CreateCapsule("p1", { height: 2, radius: 0.4 }, this.scene);
        this.player1.position = new Vector3(-4, 1, 0);
        this.player2 = MeshBuilder.CreateCapsule("p2", { height: 2, radius: 0.4 }, this.scene);
        this.player2.position = new Vector3(4, 1, 0);

        const p1Mat = new StandardMaterial("p1Mat", this.scene);
        p1Mat.diffuseColor = new Color3(0.2, 0.6, 1);
        p1Mat.emissiveColor = new Color3(0.05, 0.15, 0.3);
        this.player1.material = p1Mat;

        const p2Mat = new StandardMaterial("p2Mat", this.scene);
        p2Mat.diffuseColor = new Color3(0.9, 0.3, 0.8);
        p2Mat.emissiveColor = new Color3(0.2, 0.05, 0.15);
        this.player2.material = p2Mat;

        this.plate1 = MeshBuilder.CreateCylinder("plate1", { diameter: 2, height: 0.15 }, this.scene);
        this.plate1.position = new Vector3(-6, 0.08, 6);
        this.plate2 = MeshBuilder.CreateCylinder("plate2", { diameter: 2, height: 0.15 }, this.scene);
        this.plate2.position = new Vector3(6, 0.08, 6);

        const plateMat = new StandardMaterial("plateMat", this.scene);
        plateMat.emissiveColor = new Color3(0.1, 0.3, 0.5);
        this.plate1.material = plateMat;
        this.plate2.material = plateMat.clone("plateMat2");

        this.gate = MeshBuilder.CreateBox("gate", { width: 6, height: 4, depth: 0.5 }, this.scene);
        this.gate.position = new Vector3(0, 2, 8);
        const gateMat = new StandardMaterial("gateMat", this.scene);
        gateMat.emissiveColor = new Color3(0.8, 0.2, 0.3);
        this.gate.material = gateMat;

        window.addEventListener("keydown", this.boundDown);
        window.addEventListener("keyup", this.boundUp);

        this.engine.runRenderLoop(() => {
            const dt = this.engine.getDeltaTime() / 1000;
            this.moveActive(dt);
            this.checkPlates();
            this.scene.render();
        });

        window.addEventListener("resize", () => this.engine.resize());
        this.emit();
    }

    private activeMesh(): Mesh {
        return this.stats.activePlayer === 1 ? this.player1 : this.player2;
    }

    private moveActive(dt: number): void {
        const p = this.activeMesh();
        const speed = 6;
        if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) p.position.z += speed * dt;
        if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) p.position.z -= speed * dt;
        if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) p.position.x -= speed * dt;
        if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) p.position.x += speed * dt;
        p.position.x = Math.max(-10, Math.min(10, p.position.x));
        p.position.z = Math.max(-10, Math.min(10, p.position.z));
    }

    private switchPlayer(): void {
        this.stats.activePlayer = this.stats.activePlayer === 1 ? 2 : 1;
        this.emit();
    }

    private shiftDimension(): void {
        this.stats.dimension = this.stats.dimension === "alpha" ? "beta" : "alpha";
        if (this.stats.dimension === "beta") {
            this.scene.clearColor = new Color4(0.08, 0.02, 0.12, 1);
        } else {
            this.scene.clearColor = new Color4(0.02, 0.04, 0.1, 1);
        }
        this.emit();
    }

    private checkPlates(): void {
        this.plate1Active = Vector3.Distance(this.player1.position, this.plate1.position) < 1.5;
        this.plate2Active = Vector3.Distance(this.player2.position, this.plate2.position) < 1.5;

        const plateMat1 = this.plate1.material as StandardMaterial;
        const plateMat2 = this.plate2.material as StandardMaterial;
        plateMat1.emissiveColor = this.plate1Active ? new Color3(0.2, 0.9, 0.4) : new Color3(0.1, 0.3, 0.5);
        plateMat2.emissiveColor = this.plate2Active ? new Color3(0.2, 0.9, 0.4) : new Color3(0.1, 0.3, 0.5);

        if (this.plate1Active && this.plate2Active) {
            this.gate.scaling.y = Math.max(0.05, this.gate.scaling.y - 0.02);
            if (this.gate.scaling.y <= 0.1 && this.stats.puzzlesSolved === 0) {
                this.stats.puzzlesSolved = 1;
                this.callbacks.onWin();
                this.emit();
            }
        }
    }

    private emit(): void {
        this.callbacks.onStats({ ...this.stats });
    }
}
