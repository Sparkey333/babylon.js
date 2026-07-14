import { defineConfig } from "vite";
import path from "path";
import { commonDevViteConfiguration } from "../../public/viteToolsHelper.mjs";

export default defineConfig(
    commonDevViteConfiguration({
        port: parseInt(process.env.MASTER_AI_DASHBOARD_PORT ?? "1347"),
        aliases: {
            core: path.resolve("../../dev/core/dist"),
            gui: path.resolve("../../dev/gui/dist"),
            materials: path.resolve("../../dev/materials/dist"),
            "post-processes": path.resolve("../../dev/post-processes/dist"),
            "shared-ui-components": path.resolve("../../dev/sharedUiComponents/src"),
        },
        productionExternals: {},
    })
);
