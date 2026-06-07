import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            obsidian: resolve(__dirname, "tests/__mocks__/obsidian.ts"),
        },
    },
    test: {
        include: ["tests/**/*.test.ts"],
        environment: "happy-dom",
    },
});
