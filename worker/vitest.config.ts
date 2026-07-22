import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
        miniflare: {
          bindings: {
            ADMIN_TOKEN: "test-admin-token",
            IP_SALT: "test-salt",
            ALLOWED_ORIGINS:
              "https://jay-vocabulary.vercel.app,http://localhost:5173,http://localhost:4317",
          },
        },
      },
    },
  },
});
