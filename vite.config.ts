import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const gamebrainApiUrl = env.VITE_GAMEBRAIN_API_URL ?? "https://api.gamebrain.co/v1";
  const gamebrainToken = env.VITE_GAMEBRAIN_API_KEY ?? "";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api/gamebrain": {
          target: gamebrainApiUrl,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/gamebrain/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (gamebrainToken) {
                proxyReq.setHeader("x-api-key", gamebrainToken);
              }
            });
          },
        },
      },
    },
  };
});
