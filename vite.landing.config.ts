import fs from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

function copyLandingToIndexPlugin(): Plugin {
    return {
        name: "copy-landing-to-index",
        closeBundle() {
            const landingPath = path.resolve(
                import.meta.dirname,
                "dist-landing/landing.html"
            );
            const indexPath = path.resolve(
                import.meta.dirname,
                "dist-landing/index.html"
            );
            if (fs.existsSync(landingPath)) {
                fs.copyFileSync(landingPath, indexPath);
            }
        },
    };
}

export default defineConfig({
    plugins: [react(), tailwindcss(), copyLandingToIndexPlugin()],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "./src"),
        },
    },
    build: {
        outDir: "dist-landing",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: path.resolve(import.meta.dirname, "landing.html"),
            },
        },
    },
});
