import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/smem-board/",
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: [".manus.computer", "localhost", "127.0.0.1"],
  },
});
