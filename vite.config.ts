import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.VITE_PORT) || 3000;
  const proxyTarget = env.VITE_API_PROXY_TARGET || "http://100.83.71.112:8080";

  return {
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      port,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      viteReact(),
    ],
  };
});
