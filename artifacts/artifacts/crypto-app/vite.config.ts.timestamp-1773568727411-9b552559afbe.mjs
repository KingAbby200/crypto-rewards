// vite.config.ts
import { defineConfig } from "file:///C:/Users/USER/Downloads/SFC2/node_modules/.pnpm/vite@7.3.1_@types+node@25.5_5cee78aa4eb9ec7949da3685394fe717/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/USER/Downloads/SFC2/node_modules/.pnpm/@vitejs+plugin-react@5.2.0__dd9800b57ef4ff159b472ce0725392e3/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/USER/Downloads/SFC2/node_modules/.pnpm/@tailwindcss+vite@4.2.1_vit_172348d452a1410f59c238353c0263eb/node_modules/@tailwindcss/vite/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\USER\\Downloads\\SFC2\\artifacts\\artifacts\\crypto-app";
var port = Number(process.env.PORT ?? "3000");
var basePath = process.env.BASE_PATH ?? "/";
var apiPort = Number(process.env.API_PORT ?? "8080");
var isReplit = process.env.REPL_ID !== void 0;
var vite_config_default = defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    ...isReplit ? [
      (await import("file:///C:/Users/USER/Downloads/SFC2/node_modules/.pnpm/@replit+vite-plugin-runtime-error-modal@0.0.6/node_modules/@replit/vite-plugin-runtime-error-modal/dist/index.mjs")).default(),
      ...process.env.NODE_ENV !== "production" ? [
        await import("file:///C:/Users/USER/Downloads/SFC2/node_modules/.pnpm/@replit+vite-plugin-cartographer@0.5.0/node_modules/@replit/vite-plugin-cartographer/dist/index.mjs").then(
          (m) => m.cartographer({
            root: path.resolve(__vite_injected_original_dirname, "..")
          })
        ),
        await import("file:///C:/Users/USER/Downloads/SFC2/node_modules/.pnpm/@replit+vite-plugin-dev-banner@0.1.2/node_modules/@replit/vite-plugin-dev-banner/dist/index.mjs").then(
          (m) => m.devBanner()
        )
      ] : []
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src"),
      "@assets": path.resolve(__vite_injected_original_dirname, "..", "..", "attached_assets")
    }
  },
  root: path.resolve(__vite_injected_original_dirname),
  build: {
    outDir: path.resolve(__vite_injected_original_dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    proxy: {
      "/api": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true
      }
    }
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVU0VSXFxcXERvd25sb2Fkc1xcXFxTRkMyXFxcXGFydGlmYWN0c1xcXFxhcnRpZmFjdHNcXFxcY3J5cHRvLWFwcFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVVNFUlxcXFxEb3dubG9hZHNcXFxcU0ZDMlxcXFxhcnRpZmFjdHNcXFxcYXJ0aWZhY3RzXFxcXGNyeXB0by1hcHBcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1VTRVIvRG93bmxvYWRzL1NGQzIvYXJ0aWZhY3RzL2FydGlmYWN0cy9jcnlwdG8tYXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwiQHRhaWx3aW5kY3NzL3ZpdGVcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmNvbnN0IHBvcnQgPSBOdW1iZXIocHJvY2Vzcy5lbnYuUE9SVCA/PyBcIjMwMDBcIik7XG5jb25zdCBiYXNlUGF0aCA9IHByb2Nlc3MuZW52LkJBU0VfUEFUSCA/PyBcIi9cIjtcbmNvbnN0IGFwaVBvcnQgPSBOdW1iZXIocHJvY2Vzcy5lbnYuQVBJX1BPUlQgPz8gXCI4MDgwXCIpO1xuY29uc3QgaXNSZXBsaXQgPSBwcm9jZXNzLmVudi5SRVBMX0lEICE9PSB1bmRlZmluZWQ7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJhc2U6IGJhc2VQYXRoLFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICB0YWlsd2luZGNzcygpLFxuICAgIC4uLihpc1JlcGxpdFxuICAgICAgPyBbXG4gICAgICAgICAgKGF3YWl0IGltcG9ydChcIkByZXBsaXQvdml0ZS1wbHVnaW4tcnVudGltZS1lcnJvci1tb2RhbFwiKSkuZGVmYXVsdCgpLFxuICAgICAgICAgIC4uLihwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCJcbiAgICAgICAgICAgID8gW1xuICAgICAgICAgICAgICAgIGF3YWl0IGltcG9ydChcIkByZXBsaXQvdml0ZS1wbHVnaW4tY2FydG9ncmFwaGVyXCIpLnRoZW4oKG0pID0+XG4gICAgICAgICAgICAgICAgICBtLmNhcnRvZ3JhcGhlcih7XG4gICAgICAgICAgICAgICAgICAgIHJvb3Q6IHBhdGgucmVzb2x2ZShpbXBvcnQubWV0YS5kaXJuYW1lLCBcIi4uXCIpLFxuICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBhd2FpdCBpbXBvcnQoXCJAcmVwbGl0L3ZpdGUtcGx1Z2luLWRldi1iYW5uZXJcIikudGhlbigobSkgPT5cbiAgICAgICAgICAgICAgICAgIG0uZGV2QmFubmVyKCksXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgOiBbXSksXG4gICAgICAgIF1cbiAgICAgIDogW10pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoaW1wb3J0Lm1ldGEuZGlybmFtZSwgXCJzcmNcIiksXG4gICAgICBcIkBhc3NldHNcIjogcGF0aC5yZXNvbHZlKGltcG9ydC5tZXRhLmRpcm5hbWUsIFwiLi5cIiwgXCIuLlwiLCBcImF0dGFjaGVkX2Fzc2V0c1wiKSxcbiAgICB9LFxuICB9LFxuICByb290OiBwYXRoLnJlc29sdmUoaW1wb3J0Lm1ldGEuZGlybmFtZSksXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiBwYXRoLnJlc29sdmUoaW1wb3J0Lm1ldGEuZGlybmFtZSwgXCJkaXN0L3B1YmxpY1wiKSxcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydCxcbiAgICBob3N0OiBcIjAuMC4wLjBcIixcbiAgICBhbGxvd2VkSG9zdHM6IHRydWUsXG4gICAgZnM6IHtcbiAgICAgIHN0cmljdDogdHJ1ZSxcbiAgICAgIGRlbnk6IFtcIioqLy4qXCJdLFxuICAgIH0sXG4gICAgcHJveHk6IHtcbiAgICAgIFwiL2FwaVwiOiB7XG4gICAgICAgIHRhcmdldDogYGh0dHA6Ly9sb2NhbGhvc3Q6JHthcGlQb3J0fWAsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcHJldmlldzoge1xuICAgIHBvcnQsXG4gICAgaG9zdDogXCIwLjAuMC4wXCIsXG4gICAgYWxsb3dlZEhvc3RzOiB0cnVlLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1YLFNBQVMsb0JBQW9CO0FBQ2haLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTSxPQUFPLE9BQU8sUUFBUSxJQUFJLFFBQVEsTUFBTTtBQUM5QyxJQUFNLFdBQVcsUUFBUSxJQUFJLGFBQWE7QUFDMUMsSUFBTSxVQUFVLE9BQU8sUUFBUSxJQUFJLFlBQVksTUFBTTtBQUNyRCxJQUFNLFdBQVcsUUFBUSxJQUFJLFlBQVk7QUFFekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTTtBQUFBLEVBQ04sU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osR0FBSSxXQUNBO0FBQUEsT0FDRyxNQUFNLE9BQU8sMktBQXlDLEdBQUcsUUFBUTtBQUFBLE1BQ2xFLEdBQUksUUFBUSxJQUFJLGFBQWEsZUFDekI7QUFBQSxRQUNFLE1BQU0sT0FBTyw2SkFBa0MsRUFBRTtBQUFBLFVBQUssQ0FBQyxNQUNyRCxFQUFFLGFBQWE7QUFBQSxZQUNiLE1BQU0sS0FBSyxRQUFRLGtDQUFxQixJQUFJO0FBQUEsVUFDOUMsQ0FBQztBQUFBLFFBQ0g7QUFBQSxRQUNBLE1BQU0sT0FBTyx5SkFBZ0MsRUFBRTtBQUFBLFVBQUssQ0FBQyxNQUNuRCxFQUFFLFVBQVU7QUFBQSxRQUNkO0FBQUEsTUFDRixJQUNBLENBQUM7QUFBQSxJQUNQLElBQ0EsQ0FBQztBQUFBLEVBQ1A7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFxQixLQUFLO0FBQUEsTUFDNUMsV0FBVyxLQUFLLFFBQVEsa0NBQXFCLE1BQU0sTUFBTSxpQkFBaUI7QUFBQSxJQUM1RTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU0sS0FBSyxRQUFRLGdDQUFtQjtBQUFBLEVBQ3RDLE9BQU87QUFBQSxJQUNMLFFBQVEsS0FBSyxRQUFRLGtDQUFxQixhQUFhO0FBQUEsSUFDdkQsYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOO0FBQUEsSUFDQSxNQUFNO0FBQUEsSUFDTixjQUFjO0FBQUEsSUFDZCxJQUFJO0FBQUEsTUFDRixRQUFRO0FBQUEsTUFDUixNQUFNLENBQUMsT0FBTztBQUFBLElBQ2hCO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRLG9CQUFvQixPQUFPO0FBQUEsUUFDbkMsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQO0FBQUEsSUFDQSxNQUFNO0FBQUEsSUFDTixjQUFjO0FBQUEsRUFDaEI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
