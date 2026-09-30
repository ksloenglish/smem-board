import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  base: "/smem-board/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        leaderboards: fileURLToPath(new URL("./index.html", import.meta.url)),
        awards: fileURLToPath(new URL("./awards/index.html", import.meta.url)),
      },
    },
  },
  server: {
    host: true,
    allowedHosts: [".manus.computer", "localhost", "127.0.0.1"],
  },
});
