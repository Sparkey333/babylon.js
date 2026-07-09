import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    server: {
        port: parseInt(process.env.GAME_STUDIO_PORT ?? "1342"),
        host: true,
    },
    build: {
        target: "es2022",
        sourcemap: true,
    },
});
