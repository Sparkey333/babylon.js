import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { FollowCamera } from "@babylonjs/core/Cameras/followCamera";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import "@babylonjs/core/Helpers/sceneHelpers";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";
import "@babylonjs/loaders/glTF";

import { BABYLON_ASSETS } from "./config";
import { createInitialStats, saveHighScore, type GamePhase, type GameStats } from "./GameState";

export interface ArenaCallbacks {
    onStats: (stats: GameStats) => void;
    onPhase: (phase: GamePhase) => void;
}

interface Orb {
    mesh: Mesh;
    spin: number;
}

export class ArenaGame {
    private engine: Engine;
    private scene: Scene;
    private callbacks: ArenaCallbacks;
    private phase: GamePhase = "menu";
    private stats = createInitialStats();
    private playerRoot: TransformNode | null = null;
    private playerMesh: Mesh | null = null;
    private camera: FollowCamera | null = null;
    private orbs: Orb[] = [];
    private obstacles: Mesh[] = [];
    private keys = new Set<string>();
    private elapsed = 0;
    private spawnTimer = 0;
    private orbTimer = 0;
    private disposed = false;
    private boundKeyDown: (e: KeyboardEvent) => void;
    private boundKeyUp: (e: KeyboardEvent) => void;

    constructor(canvas: HTMLCanvasElement, callbacks: ArenaCallbacks) {
        this.callbacks = callbacks;
        this.engine = new Engine(canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true,
            adaptToDeviceRatio: true,
        });

        this.scene = new Scene(this.engine);
        this.scene.clearColor = new Color4(0.02, 0.03, 0.08, 1);

        this.boundKeyDown = (e) => this.keys.add(e.code);
        this.boundKeyUp = (e) => this.keys.delete(e.code);

        void this.bootstrap();
    }

    getScene(): Scene {
        return this.scene;
    }

    getPhase(): GamePhase {
        return this.phase;
    }

    startGame(): void {
        this.resetRound();
        this.setPhase("playing");
    }

    pauseGame(): void {
        if (this.phase === "playing") {
            this.setPhase("paused");
        }
    }

    resumeGame(): void {
        if (this.phase === "paused") {
            this.setPhase("playing");
        }
    }

    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        window.removeEventListener("keydown", this.boundKeyDown);
        window.removeEventListener("keyup", this.boundKeyUp);
        this.scene.dispose();
        this.engine.dispose();
    }

    private async bootstrap(): Promise<void> {
        await this.buildEnvironment();
        await this.loadPlayer();
        this.setupInput();
        this.setupLoop();
        this.emitStats();
        this.setPhase("menu");
    }

    private async buildEnvironment(): Promise<void> {
        const envTex = CubeTexture.CreateFromPrefilteredData(BABYLON_ASSETS.environment, this.scene);
        this.scene.environmentTexture = envTex;
        this.scene.createDefaultSkybox(envTex, true, 1000, 0.25);

        new HemisphericLight("sun", new Vector3(0.2, 1, 0.1), this.scene);

        const glow = new GlowLayer("glow", this.scene, { blurKernelSize: 32 });
        glow.intensity = 0.6;

        const arena = MeshBuilder.CreateGround("arena", { width: 80, height: 80, subdivisions: 32 }, this.scene);
        const gridMat = new StandardMaterial("gridMat", this.scene);
        gridMat.diffuseColor = new Color3(0.08, 0.12, 0.2);
        gridMat.emissiveColor = new Color3(0.02, 0.08, 0.15);
        gridMat.specularColor = Color3.Black();
        arena.material = gridMat;

        for (let i = 0; i < 12; i++) {
            const ring = MeshBuilder.CreateTorus(
                "ring" + i,
                { diameter: 8 + i * 4, thickness: 0.08, tessellation: 48 },
                this.scene
            );
            ring.position.y = 0.05;
            const mat = new PBRMaterial("ringMat" + i, this.scene);
            mat.emissiveColor = new Color3(0.1 + i * 0.02, 0.4, 0.9 - i * 0.02);
            mat.alpha = 0.35;
            mat.metallic = 0.9;
            mat.roughness = 0.2;
            ring.material = mat;
        }
    }

    private async loadPlayer(): Promise<void> {
        this.playerRoot = new TransformNode("playerRoot", this.scene);
        this.playerRoot.position = new Vector3(0, 2, 0);

        const result = await SceneLoader.ImportMeshAsync("", BABYLON_ASSETS.plane, "", this.scene);
        const plane = result.meshes.find((m) => m.name !== "__root__") ?? result.meshes[0];
        plane.parent = this.playerRoot;
        plane.scaling.scaleInPlace(0.35);
        plane.rotationQuaternion = null;
        plane.rotation.y = Math.PI;
        this.playerMesh = plane as Mesh;

        this.camera = new FollowCamera("followCam", new Vector3(0, 8, -14), this.scene);
        this.camera.lockedTarget = this.playerMesh;
        this.camera.radius = 16;
        this.camera.heightOffset = 5;
        this.camera.rotationOffset = 180;
        this.camera.cameraAcceleration = 0.08;
        this.camera.maxCameraSpeed = 12;
        this.scene.activeCamera = this.camera;
    }

    private setupInput(): void {
        window.addEventListener("keydown", this.boundKeyDown);
        window.addEventListener("keyup", this.boundKeyUp);
    }

    private setupLoop(): void {
        this.engine.runRenderLoop(() => {
            const dt = this.engine.getDeltaTime() / 1000;
            if (this.phase === "playing") {
                this.update(dt);
            }
            this.scene.render();
        });

        window.addEventListener("resize", () => this.engine.resize());
    }

    private setPhase(phase: GamePhase): void {
        this.phase = phase;
        this.callbacks.onPhase(phase);
    }

    private emitStats(): void {
        this.callbacks.onStats({ ...this.stats });
    }

    private resetRound(): void {
        this.stats = { ...createInitialStats(), highScore: this.stats.highScore };
        this.elapsed = 0;
        this.spawnTimer = 0;
        this.orbTimer = 0;
        this.clearEntities();
        if (this.playerRoot) {
            this.playerRoot.position = new Vector3(0, 2, 0);
            this.playerRoot.rotationQuaternion = null;
            this.playerRoot.rotation.set(0, Math.PI, 0);
        }
        this.spawnOrb();
        this.emitStats();
    }

    private clearEntities(): void {
        for (const orb of this.orbs) orb.mesh.dispose();
        for (const obs of this.obstacles) obs.dispose();
        this.orbs = [];
        this.obstacles = [];
    }

    private update(dt: number): void {
        this.elapsed += dt;
        this.stats.timeAlive = this.elapsed;
        this.movePlayer(dt);
        this.updateOrbs(dt);
        this.updateObstacles(dt);
        this.spawnSystems(dt);
        this.checkCollisions();
        this.stats.score += Math.floor(dt * 10 * (1 + this.stats.combo * 0.1));
        this.emitStats();
    }

    private movePlayer(dt: number): void {
        if (!this.playerRoot) return;
        const speed = 18;
        const turn = 2.8;
        let thrust = 0;
        let yaw = 0;

        if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) thrust += 1;
        if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) thrust -= 0.5;
        if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) yaw -= 1;
        if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) yaw += 1;

        this.playerRoot.rotation.y += yaw * turn * dt;

        const forward = this.playerRoot.getDirection(Vector3.Forward());
        this.playerRoot.position.addInPlace(forward.scale(thrust * speed * dt));
        this.playerRoot.position.y = 2 + Math.sin(this.elapsed * 2) * 0.15;

        const limit = 35;
        this.playerRoot.position.x = Math.max(-limit, Math.min(limit, this.playerRoot.position.x));
        this.playerRoot.position.z = Math.max(-limit, Math.min(limit, this.playerRoot.position.z));

        if (this.playerMesh) {
            this.playerMesh.rotation.z = -yaw * 0.4;
        }
    }

    private spawnSystems(dt: number): void {
        this.orbTimer -= dt;
        if (this.orbTimer <= 0) {
            this.spawnOrb();
            this.orbTimer = 2.5 - Math.min(1.5, this.elapsed * 0.02);
        }

        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnObstacle();
            this.spawnTimer = 1.8 - Math.min(1.2, this.elapsed * 0.015);
        }
    }

    private spawnOrb(): void {
        const orb = MeshBuilder.CreateSphere("orb", { diameter: 1.2, segments: 16 }, this.scene);
        orb.position = new Vector3((Math.random() - 0.5) * 50, 2 + Math.random() * 4, (Math.random() - 0.5) * 50);
        const mat = new PBRMaterial("orbMat", this.scene);
        mat.emissiveColor = new Color3(0.2, 0.9, 1);
        mat.metallic = 0.2;
        mat.roughness = 0.1;
        orb.material = mat;
        this.addOrbParticles(orb);
        this.orbs.push({ mesh: orb, spin: 1 + Math.random() });
    }

    private addOrbParticles(orb: Mesh): void {
        const ps = new ParticleSystem("orbPs", 60, this.scene);
        ps.particleTexture = new Texture("https://assets.babylonjs.com/textures/flare.png", this.scene);
        ps.emitter = orb;
        ps.minEmitBox = new Vector3(-0.2, -0.2, -0.2);
        ps.maxEmitBox = new Vector3(0.2, 0.2, 0.2);
        ps.color1 = new Color4(0.2, 0.8, 1, 0.8);
        ps.color2 = new Color4(0.8, 0.2, 1, 0.4);
        ps.minSize = 0.05;
        ps.maxSize = 0.2;
        ps.emitRate = 40;
        ps.minLifeTime = 0.2;
        ps.maxLifeTime = 0.6;
        ps.direction1 = new Vector3(-0.5, 0.5, -0.5);
        ps.direction2 = new Vector3(0.5, 1, 0.5);
        ps.start();
    }

    private spawnObstacle(): void {
        const obs = MeshBuilder.CreateBox("obs", { size: 1.8 + Math.random() * 2 }, this.scene);
        const edge = Math.random() > 0.5 ? 38 : -38;
        const axis = Math.random() > 0.5;
        obs.position = new Vector3(axis ? edge : (Math.random() - 0.5) * 60, 2, axis ? (Math.random() - 0.5) * 60 : edge);
        const mat = new StandardMaterial("obsMat", this.scene);
        mat.emissiveColor = new Color3(1, 0.15, 0.35);
        mat.diffuseColor = new Color3(0.3, 0.05, 0.1);
        obs.material = mat;
        obs.metadata = { vx: (Math.random() - 0.5) * 8, vz: (Math.random() - 0.5) * 8 };
        this.obstacles.push(obs);
    }

    private updateOrbs(dt: number): void {
        for (const orb of this.orbs) {
            orb.mesh.rotation.y += orb.spin * dt;
            orb.mesh.position.y += Math.sin(this.elapsed * 3 + orb.spin) * dt * 0.5;
        }
    }

    private updateObstacles(dt: number): void {
        for (const obs of this.obstacles) {
            const meta = obs.metadata as { vx: number; vz: number };
            obs.position.x += meta.vx * dt;
            obs.position.z += meta.vz * dt;
            obs.rotation.y += dt * 0.8;
            if (Math.abs(obs.position.x) > 42) meta.vx *= -1;
            if (Math.abs(obs.position.z) > 42) meta.vz *= -1;
        }
    }

    private checkCollisions(): void {
        if (!this.playerRoot) return;
        const p = this.playerRoot.position;

        for (let i = this.orbs.length - 1; i >= 0; i--) {
            if (Vector3.Distance(p, this.orbs[i].mesh.position) < 2.2) {
                this.orbs[i].mesh.dispose();
                this.orbs.splice(i, 1);
                this.stats.orbsCollected += 1;
                this.stats.combo += 1;
                this.stats.score += 250 * this.stats.combo;
            }
        }

        for (const obs of this.obstacles) {
            if (Vector3.Distance(p, obs.position) < 2.5) {
                this.endGame();
                return;
            }
        }
    }

    private endGame(): void {
        if (this.stats.score > this.stats.highScore) {
            this.stats.highScore = this.stats.score;
            saveHighScore(this.stats.highScore);
        }
        this.stats.combo = 0;
        this.setPhase("gameover");
        this.emitStats();
    }
}
