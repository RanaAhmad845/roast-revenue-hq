import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration: enables React JSX and the local development server.
export default defineConfig({
  plugins: [react()],
});
