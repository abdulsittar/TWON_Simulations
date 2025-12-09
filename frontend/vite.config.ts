import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // force all imports to use the same React
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom"),
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['lss-twon.ijs.si'], // ✅ Add your host here
    port: 1076, // optional
  },
});
