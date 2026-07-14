import { Engine } from "core/Engines/engine";
import { Scene } from "core/scene";
import { ArcRotateCamera } from "core/Cameras/arcRotateCamera";
import { Vector3, Color3, Color4 } from "core/Maths/math";
import { HemisphericLight } from "core/Lights/hemisphericLight";
import { PointLight } from "core/Lights/pointLight";
import { MeshBuilder } from "core/Meshes/meshBuilder";
import { StandardMaterial } from "core/Materials/standardMaterial";
import { GlowLayer } from "core/Layers/glowLayer";
import { ParticleSystem } from "core/Particles/particleSystem";
import { Texture } from "core/Materials/Textures/texture";
import { GridMaterial } from "materials/grid/gridMaterial";
import { DefaultRenderingPipeline } from "core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { type AbstractMesh } from "core/Meshes/abstractMesh";
import { type TransformNode } from "core/Meshes/transformNode";
import { AdvancedDynamicTexture } from "gui/2D/advancedDynamicTexture";
import { TextBlock } from "gui/2D/controls/textBlock";
import { LIFE_ZONES, type LifeZone, type LifeZoneId } from "./data/lifeZones";
import { type Project } from "./data/projects";
import { type CockpitSceneApi } from "./types";

import "core/Helpers/sceneHelpers";

const STATION_RADIUS = 6;
const COCKPIT_RING_RADIUS = 2.8;

interface ZoneStation {
    zone: LifeZone;
    root: TransformNode;
    glowMesh: AbstractMesh;
    label: TextBlock;
}

export class CockpitScene implements CockpitSceneApi {
    private readonly _engine: Engine;
    private readonly _scene: Scene;
    private readonly _camera: ArcRotateCamera;
    private readonly _stations: Map<LifeZoneId, ZoneStation> = new Map();
    private _highlightMesh: AbstractMesh | null = null;
    private _targetAlpha = 0;
    private _targetBeta = Math.PI / 2.4;
    private _targetRadius = 9;
    private _animating = false;

    public constructor(canvas: HTMLCanvasElement) {
        this._engine = new Engine(canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true,
        });

        this._scene = new Scene(this._engine);
        this._scene.clearColor = new Color4(0.02, 0.02, 0.06, 1);

        this._camera = new ArcRotateCamera("cockpitCam", -Math.PI / 2, Math.PI / 2.4, 9, Vector3.Zero(), this._scene);
        this._camera.lowerRadiusLimit = 4;
        this._camera.upperRadiusLimit = 16;
        this._camera.wheelPrecision = 30;
        this._camera.panningSensibility = 0;
        this._camera.attachControl(canvas, true);

        this._buildEnvironment();
        this._buildCockpitFrame();
        this._buildZoneStations();
        this._buildStarfield();
        this._buildPostProcessing();

        this._scene.onBeforeRenderObservable.add(() => this._animateCamera());

        this._engine.runRenderLoop(() => this._scene.render());
        window.addEventListener("resize", () => this._engine.resize());
    }

    public dispose(): void {
        this._scene.dispose();
        this._engine.dispose();
    }

    public focusZone(zoneId: LifeZoneId): void {
        const zone = LIFE_ZONES.find((z) => z.id === zoneId);
        if (!zone) return;

        this._targetAlpha = -Math.PI / 2 + zone.stationAngle;
        this._targetBeta = Math.PI / 2.5;
        this._targetRadius = 7;
        this._animating = true;

        const station = this._stations.get(zoneId);
        if (station) {
            station.glowMesh.scaling.setAll(1.4);
            setTimeout(() => station.glowMesh.scaling.setAll(1), 600);
        }
    }

    public highlightProject(project: Project | null): void {
        if (this._highlightMesh) {
            this._highlightMesh.dispose();
            this._highlightMesh = null;
        }
        if (!project) return;

        const station = this._stations.get(project.zone);
        if (!station) return;

        const pulse = MeshBuilder.CreateSphere("pulse", { diameter: 0.6, segments: 8 }, this._scene);
        pulse.parent = station.root;
        pulse.position.y = 1.2;

        const mat = new StandardMaterial("pulseMat", this._scene);
        mat.emissiveColor = Color3.FromHexString(LIFE_ZONES.find((z) => z.id === project.zone)?.color ?? "#00e5ff");
        mat.alpha = 0.7;
        pulse.material = mat;

        this._highlightMesh = pulse;
        this.focusZone(project.zone);
    }

    public setCameraSensitivity(value: number): void {
        this._camera.angularSensibilityX = 4000 / value;
        this._camera.angularSensibilityY = 4000 / value;
    }

    private _animateCamera(): void {
        if (!this._animating) return;

        const lerp = 0.04;
        this._camera.alpha += (this._targetAlpha - this._camera.alpha) * lerp;
        this._camera.beta += (this._targetBeta - this._camera.beta) * lerp;
        this._camera.radius += (this._targetRadius - this._camera.radius) * lerp;

        if (
            Math.abs(this._targetAlpha - this._camera.alpha) < 0.01 &&
            Math.abs(this._targetBeta - this._camera.beta) < 0.01 &&
            Math.abs(this._targetRadius - this._camera.radius) < 0.05
        ) {
            this._animating = false;
        }

        if (this._highlightMesh) {
            const scale = 1 + Math.sin(Date.now() * 0.005) * 0.15;
            this._highlightMesh.scaling.setAll(scale);
        }
    }

    private _buildEnvironment(): void {
        const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), this._scene);
        hemi.intensity = 0.3;
        hemi.groundColor = new Color3(0.05, 0.02, 0.15);
        hemi.diffuse = new Color3(0.2, 0.4, 0.8);

        const grid = MeshBuilder.CreateGround("grid", { width: 40, height: 40, subdivisions: 40 }, this._scene);
        grid.position.y = -3;
        const gridMat = new GridMaterial("gridMat", this._scene);
        gridMat.majorUnitFrequency = 5;
        gridMat.minorUnitVisibility = 0.35;
        gridMat.gridRatio = 1;
        gridMat.backFaceCulling = false;
        gridMat.mainColor = new Color3(0.02, 0.05, 0.12);
        gridMat.lineColor = new Color3(0, 0.6, 0.9);
        gridMat.opacity = 0.55;
        grid.material = gridMat;
    }

    private _buildCockpitFrame(): void {
        const ring = MeshBuilder.CreateTorus("cockpitRing", { diameter: COCKPIT_RING_RADIUS * 2, thickness: 0.12, tessellation: 64 }, this._scene);
        const ringMat = new StandardMaterial("ringMat", this._scene);
        ringMat.emissiveColor = new Color3(0, 0.5, 0.8);
        ringMat.diffuseColor = new Color3(0.1, 0.2, 0.4);
        ringMat.alpha = 0.85;
        ring.material = ringMat;

        const console = MeshBuilder.CreateBox("console", { width: 3.2, height: 0.15, depth: 1.8 }, this._scene);
        console.position = new Vector3(0, -0.5, 1.2);
        console.rotation.x = -0.3;
        const consoleMat = new StandardMaterial("consoleMat", this._scene);
        consoleMat.emissiveColor = new Color3(0.05, 0.15, 0.35);
        consoleMat.diffuseColor = new Color3(0.08, 0.12, 0.25);
        console.material = consoleMat;

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const strut = MeshBuilder.CreateCylinder(`strut${i}`, { height: 0.8, diameter: 0.06 }, this._scene);
            strut.position = new Vector3(Math.cos(angle) * 1.4, 0.2, Math.sin(angle) * 1.4);
            strut.rotation.x = Math.PI / 2;
            strut.rotation.z = angle;
            const strutMat = new StandardMaterial(`strutMat${i}`, this._scene);
            strutMat.emissiveColor = new Color3(0, 0.3, 0.6);
            strut.material = strutMat;
        }

        const glow = new GlowLayer("cockpitGlow", this._scene);
        glow.intensity = 0.6;
    }

    private _buildZoneStations(): void {
        for (const zone of LIFE_ZONES) {
            const root = MeshBuilder.CreateBox(`stationRoot_${zone.id}`, { size: 0.01 }, this._scene);
            root.isVisible = false;
            root.position = new Vector3(
                Math.cos(zone.stationAngle) * STATION_RADIUS,
                0.5,
                Math.sin(zone.stationAngle) * STATION_RADIUS
            );
            root.lookAt(Vector3.Zero());

            const panel = MeshBuilder.CreateBox(`panel_${zone.id}`, { width: 1.6, height: 1.0, depth: 0.08 }, this._scene);
            panel.parent = root;
            panel.position.y = 0.8;

            const panelMat = new StandardMaterial(`panelMat_${zone.id}`, this._scene);
            const c = Color3.FromHexString(zone.color);
            panelMat.emissiveColor = c.scale(0.6);
            panelMat.diffuseColor = c.scale(0.3);
            panelMat.alpha = 0.9;
            panel.material = panelMat;

            const glowOrb = MeshBuilder.CreateSphere(`glow_${zone.id}`, { diameter: 0.25, segments: 8 }, this._scene);
            glowOrb.parent = root;
            glowOrb.position.y = 1.5;
            const glowMat = new StandardMaterial(`glowMat_${zone.id}`, this._scene);
            glowMat.emissiveColor = c;
            glowMat.alpha = 0.8;
            glowOrb.material = glowMat;

            const light = new PointLight(`light_${zone.id}`, new Vector3(0, 1.5, 0), this._scene);
            light.parent = root;
            light.diffuse = c;
            light.intensity = 0.4;
            light.range = 4;

            const adt = AdvancedDynamicTexture.CreateForMesh(panel, 256, 160);
            const label = new TextBlock(`label_${zone.id}`, `${zone.icon} ${zone.label.toUpperCase()}`);
            label.color = zone.color;
            label.fontSize = 28;
            label.fontFamily = "Orbitron, monospace";
            adt.addControl(label);

            this._stations.set(zone.id, { zone, root, glowMesh: glowOrb, label });
        }
    }

    private _buildStarfield(): void {
        const particleSystem = new ParticleSystem("stars", 1200, this._scene);
        particleSystem.particleTexture = new Texture("https://assets.babylonjs.com/textures/flare.png", this._scene);
        particleSystem.emitter = Vector3.Zero();
        particleSystem.minEmitBox = new Vector3(-30, -15, -30);
        particleSystem.maxEmitBox = new Vector3(30, 15, 30);
        particleSystem.color1 = new Color4(0.7, 0.85, 1, 1);
        particleSystem.color2 = new Color4(0.3, 0.5, 1, 0.6);
        particleSystem.minSize = 0.02;
        particleSystem.maxSize = 0.08;
        particleSystem.minLifeTime = 99999;
        particleSystem.maxLifeTime = 99999;
        particleSystem.emitRate = 1200;
        particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;
        particleSystem.gravity = new Vector3(0, 0, 0);
        particleSystem.direction1 = Vector3.Zero();
        particleSystem.direction2 = Vector3.Zero();
        particleSystem.minEmitPower = 0;
        particleSystem.maxEmitPower = 0;
        particleSystem.updateSpeed = 0.01;
        particleSystem.start();
    }

    private _buildPostProcessing(): void {
        const pipeline = new DefaultRenderingPipeline("pipeline", true, this._scene, [this._camera]);
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.4;
        pipeline.bloomWeight = 0.35;
        pipeline.bloomKernel = 48;
        pipeline.chromaticAberrationEnabled = true;
        pipeline.chromaticAberration.aberrationAmount = 8;
        pipeline.grainEnabled = true;
        pipeline.grain.intensity = 12;
    }
}

export function createCockpitScene(canvas: HTMLCanvasElement): CockpitScene {
    return new CockpitScene(canvas);
}
