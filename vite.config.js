import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base должен совпадать с именем репозитория на GitHub Pages:
// https://<user>.github.io/EventLoopTrainer/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/EventLoopTrainer/" : "/",
}));
