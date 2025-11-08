import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 5000,
      host: "0.0.0.0",
      allowedHosts: [
        "35238faa-addd-4b26-b020-1cc513ce2749-00-3t4bj0ksgeccr.sisko.replit.dev", // ✅ your current Replit host
        "all" // ✅ fallback for future dynamic hosts
      ],
    },
    plugins: [react()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});