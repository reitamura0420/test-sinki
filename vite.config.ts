/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom", // Reactの場合はこれ推奨
    setupFiles: "./src/vitest-setup.ts",
  },
});
