import { insertComment, listComments } from "./db";
import { hashIp, validateComment } from "./validate";

export interface Env {
  DB: D1Database;
  ADMIN_TOKEN: string;
  IP_SALT: string;
  ALLOWED_ORIGINS: string;
}

const json = (data: unknown, status = 200) => Response.json(data, { status });

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/comments" && request.method === "GET") {
      const setSlug = url.searchParams.get("set") ?? undefined;
      const wordSlug = url.searchParams.get("word") ?? undefined;
      if (wordSlug && !setSlug) {
        return json({ error: "A word filter requires a set." }, 400);
      }
      return json({ comments: await listComments(env.DB, { setSlug, wordSlug }) });
    }

    if (url.pathname === "/api/comments" && request.method === "POST") {
      let payload: unknown;
      try {
        payload = await request.json();
      } catch {
        return json({ error: "Expected a JSON object." }, 400);
      }

      const parsed = validateComment(payload);
      if (!parsed.ok) return json({ error: parsed.error }, 400);

      if (!env.IP_SALT) {
        return json({ error: "Server misconfigured." }, 500);
      }

      // Cloudflare always sets this in production. Absent it (local dev), every
      // caller collapses onto one hash and rate limiting becomes global rather
      // than per-IP — acceptable locally, never true in front of the CDN.
      const ip = request.headers.get("CF-Connecting-IP") ?? "0.0.0.0";
      const ipHash = await hashIp(ip, env.IP_SALT);

      const comment = await insertComment(env.DB, { ...parsed.value, ipHash });
      return json({ comment }, 201);
    }

    return new Response("Not found", { status: 404 });
  },
};
