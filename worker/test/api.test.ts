import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import worker from "../src/index";
import schema from "../schema.sql?raw";

async function call(path: string, init?: RequestInit) {
  const request = new Request(`https://example.com${path}`, init);
  const ctx = createExecutionContext();
  const response = await worker.fetch(request, env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

beforeEach(async () => {
  for (const stmt of schema.split(";").map((s) => s.trim()).filter(Boolean)) {
    await env.DB.prepare(stmt).run();
  }
  await env.DB.prepare("DELETE FROM comments").run();
});

describe("GET /api/comments", () => {
  it("returns an empty list when nothing has been posted", async () => {
    const response = await call("/api/comments");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ comments: [] });
  });
});
