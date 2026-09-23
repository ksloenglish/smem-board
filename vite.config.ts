import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/smem-board/",
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [".manus.computer", "localhost", "127.0.0.1"],
  },
});
