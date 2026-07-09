import type { ProjectOptions } from "../index";

const PLANE_URL = "https://assets.babylonjs.com/meshes/Demos/optimized/acrobaticPlane_variants.glb";
const ENV_URL = "https://assets.babylonjs.com/environments/environmentSpecular.env";

function es6GameScene(language: "ts" | "js"): string {
    const canvasCast = language === "ts" ? " as HTMLCanvasElement" : "";
    return `import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { FollowCamera } from "@babylonjs/core/Cameras/followCamera";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui/2D";

import "@babylonjs/core/Helpers/sceneHelpers";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";
import "@babylonjs/loaders/glTF";

const canvas = document.getElementById("renderCanvas")${canvasCast};
const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

let score = 0;
const keys = new Set<string>();

window.addEventListener("keydown", (e) => keys.add(e.code));
window.addEventListener("keyup", (e) => keys.delete(e.code));

const createScene = async () => {
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.02, 0.03, 0.08, 1);

    const envTex = CubeTexture.CreateFromPrefilteredData("${ENV_URL}", scene);
    scene.environmentTexture = envTex;
    scene.createDefaultSkybox(envTex, true, 1000, 0.25);
    new HemisphericLight("sun", new Vector3(0.2, 1, 0.1), scene);
    new GlowLayer("glow", scene, { blurKernelSize: 32 });

    const ground = MeshBuilder.CreateGround("ground", { width: 60, height: 60 }, scene);
    const gMat = new StandardMaterial("gMat", scene);
    gMat.diffuseColor = new Color3(0.08, 0.12, 0.2);
    ground.material = gMat;

    const playerRoot = new TransformNode("player", scene);
    playerRoot.position.y = 2;
    const loaded = await SceneLoader.ImportMeshAsync("", "${PLANE_URL}", "", scene);
    const ship = loaded.meshes.find((m) => m.name !== "__root__") ?? loaded.meshes[0];
    ship.parent = playerRoot;
    ship.scaling.scaleInPlace(0.35);
    ship.rotation.y = Math.PI;

    const camera = new FollowCamera("cam", new Vector3(0, 8, -14), scene);
    camera.lockedTarget = playerRoot;
    camera.radius = 16;
    camera.heightOffset = 5;
    camera.rotationOffset = 180;
    scene.activeCamera = camera;

    const orb = MeshBuilder.CreateSphere("orb", { diameter: 1.2 }, scene);
    orb.position = new Vector3(8, 3, 8);
    const orbMat = new PBRMaterial("orbMat", scene);
    orbMat.emissiveColor = new Color3(0.2, 0.9, 1);
    orb.material = orbMat;

    const ui = AdvancedDynamicTexture.CreateFullscreenUI("ui");
    const label = new TextBlock("score", "Score: 0");
    label.color = "white";
    label.fontSize = 22;
    label.top = "-42%";
    ui.addControl(label);

    let elapsed = 0;
    scene.onBeforeRenderObservable.add(() => {
        const dt = engine.getDeltaTime() / 1000;
        elapsed += dt;
        let thrust = 0;
        let yaw = 0;
        if (keys.has("KeyW") || keys.has("ArrowUp")) thrust += 1;
        if (keys.has("KeyS") || keys.has("ArrowDown")) thrust -= 0.5;
        if (keys.has("KeyA") || keys.has("ArrowLeft")) yaw -= 1;
        if (keys.has("KeyD") || keys.has("ArrowRight")) yaw += 1;
        playerRoot.rotation.y += yaw * 2.5 * dt;
        const forward = playerRoot.getDirection(Vector3.Forward());
        playerRoot.position.addInPlace(forward.scale(thrust * 16 * dt));
        orb.position.y = 3 + Math.sin(elapsed * 2) * 0.5;
        if (Vector3.Distance(playerRoot.position, orb.position) < 2) {
            score += 100;
            orb.position.x = (Math.random() - 0.5) * 40;
            orb.position.z = (Math.random() - 0.5) * 40;
        }
        score += Math.floor(dt * 5);
        label.text = "Score: " + score;
    });

    return scene;
};

createScene().then((scene) => {
    engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => engine.resize());
`;
}

function umdGameScene(language: "ts" | "js"): string {
    const canvasCast = language === "ts" ? " as HTMLCanvasElement" : "";
    const sceneType = language === "ts" ? ": BABYLON.Scene" : "";
    return `import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import "babylonjs-gui";

const canvas = document.getElementById("renderCanvas")${canvasCast};
const engine = new BABYLON.Engine(canvas, true);

let score = 0;
const keys = new Set<string>();
window.addEventListener("keydown", (e) => keys.add(e.code));
window.addEventListener("keyup", (e) => keys.delete(e.code));

const createScene = async function ()${sceneType} {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.02, 0.03, 0.08, 1);
    await BABYLON.AppendSceneAsync("${PLANE_URL}", scene);
    scene.createDefaultCamera(true, true, true);
    scene.createDefaultEnvironment({ createGround: true, createSkybox: true });
    return scene;
};

createScene().then((scene) => {
    engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => engine.resize());
`;
}

export function generateGameSceneCode(options: ProjectOptions): string {
    const { moduleFormat, language } = options;
    if (moduleFormat === "es6") return es6GameScene(language);
    return umdGameScene(language);
}
