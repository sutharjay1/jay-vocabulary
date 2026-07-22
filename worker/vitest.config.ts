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
            // Must stay identical to wrangler.toml's [vars] so the suite
            // exercises the same allowlist production does.
            ALLOWED_ORIGINS:
              "https://jay-vocabulary.vercel.app,https://*-sutharjay.vercel.app,http://localhost:*",
          },
        },
      },
    },
  },
});
