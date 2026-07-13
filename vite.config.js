import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";

// base должен совпадать с именем репозитория на GitHub Pages:
// https://<user>.github.io/EventLoopTrainer/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/EventLoopTrainer/" : "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
