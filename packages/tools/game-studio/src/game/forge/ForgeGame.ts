import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import "@babylonjs/core/Helpers/sceneHelpers";

export interface ForgeStats {
    modules: number;
    production: number;
    oreStored: number;
}

export interface ForgeCallbacks {
    onStats: (stats: ForgeStats) => void;
}

export class ForgeGame {
    private engine: Engine;
    private scene: Scene;
    private callbacks: ForgeCallbacks;
    private modules: Mesh[] = [];
    private stats: ForgeStats = { modules: 0, production: 0, oreStored: 0 };
    private disposed = false;
    private tickAcc = 0;

    constructor(canvas: HTMLCanvasElement, callbacks: ForgeCallbacks) {
        this.callbacks = callbacks;
        this.engine = new Engine(canvas, true, { adaptToDeviceRatio: true });
        this.scene = new Scene(this.engine);
        this.scene.clearColor = new Color4(0.01, 0.02, 0.06, 1);
        this.build();
    }

    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.scene.dispose();
        this.engine.dispose();
    }

    private build(): void {
        new HemisphericLight("sun", new Vector3(0, 1, 0.2), this.scene);
        new GlowLayer("glow", this.scene).intensity = 0.5;

        const camera = new ArcRotateCamera("cam", -Math.PI / 2, 1.1, 35, Vector3.Zero(), this.scene);
        camera.attachControl(this.engine.getRenderingCanvas(), true);
        camera.lowerRadiusLimit = 15;
        camera.upperRadiusLimit = 60;
        this.scene.activeCamera = camera;

        const planet = MeshBuilder.CreateSphere("planet", { diameter: 40, segments: 32 }, this.scene);
        planet.position.y = -30;
        const planetMat = new PBRMaterial("planetMat", this.scene);
        planetMat.albedoColor = new Color3(0.1, 0.3, 0.6);
        planetMat.emissiveColor = new Color3(0.02, 0.05, 0.12);
        planet.material = planetMat;

        const ring = MeshBuilder.CreateTorus("ring", { diameter: 28, thickness: 1.2, tessellation: 64 }, this.scene);
        ring.rotation.x = Math.PI / 2;
        const ringMat = new StandardMaterial("ringMat", this.scene);
        ringMat.diffuseColor = new Color3(0.15, 0.2, 0.3);
        ringMat.emissiveColor = new Color3(0.05, 0.1, 0.2);
        ring.material = ringMat;

        const pad = MeshBuilder.CreateCylinder("pad", { diameter: 20, height: 0.4, tessellation: 48 }, this.scene);
        pad.position.y = 0.2;
        const padMat = new StandardMaterial("padMat", this.scene);
        padMat.diffuseColor = new Color3(0.2, 0.25, 0.35);
        padMat.emissiveColor = new Color3(0.02, 0.08, 0.15);
        pad.material = padMat;

        this.scene.onPointerObservable.add((pi) => {
            if (pi.type !== PointerEventTypes.POINTERDOWN) return;
            const pick = pi.pickInfo;
            if (!pick?.hit || !pick.pickedMesh || pick.pickedMesh.name !== "pad") return;
            this.placeModule(pick.pickedPoint!);
        });

        this.engine.runRenderLoop(() => {
            const dt = this.engine.getDeltaTime() / 1000;
            this.tickAcc += dt;
            if (this.tickAcc >= 1) {
                this.stats.production = this.stats.modules * 5;
                this.stats.oreStored += this.stats.production;
                this.tickAcc = 0;
                this.emit();
            }
            for (const m of this.modules) {
                m.rotation.y += dt * 0.5;
            }
            this.scene.render();
        });

        window.addEventListener("resize", () => this.engine.resize());
        this.emit();
    }

    private placeModule(pos: Vector3): void {
        if (this.modules.length >= 24) return;
        const mod = MeshBuilder.CreateBox("mod" + this.modules.length, { size: 1.2 }, this.scene);
        mod.position = new Vector3(pos.x, 0.8, pos.z);
        const mat = new PBRMaterial("modMat" + this.modules.length, this.scene);
        mat.emissiveColor = new Color3(0.2 + Math.random() * 0.3, 0.6, 0.9);
        mat.metallic = 0.8;
        mat.roughness = 0.2;
        mod.material = mat;
        this.modules.push(mod);
        this.stats.modules = this.modules.length;
        this.emit();
    }

    private emit(): void {
        this.callbacks.onStats({ ...this.stats });
    }
}
