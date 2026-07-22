import { corsHeaders, withCors } from "./cors";
import { deleteComment, insertComment, listComments } from "./db";
import { isRateLimited } from "./ratelimit";
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
    const cors = corsHeaders(request, env.ALLOWED_ORIGINS);

    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }), cors);
    }

    /* An exception escaping route() would skip withCors, so the browser would
       see an opaque CORS failure instead of the 500 — the one error you most
       need to read. Catch it here so even a crash carries the headers. */
    let response: Response;
    try {
      response = await route(request, env);
    } catch (err) {
      // Logged so a D1 failure (or any other crash) is visible in
      // `wrangler tail` instead of vanishing into a generic 500.
      console.error(err);
      response = json({ error: "Something went wrong." }, 500);
    }
    return withCors(response, cors);
  },
};

async function route(request: Request, env: Env): Promise<Response> {
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

    if (await isRateLimited(env.DB, ipHash, Date.now())) {
      return json({ error: "Too many comments. Try again in a few minutes." }, 429);
    }

    const comment = await insertComment(env.DB, { ...parsed.value, ipHash });
    return json({ comment }, 201);
  }

  const del = url.pathname.match(/^\/api\/comments\/([A-Za-z0-9-]+)$/);
  if (del && request.method === "DELETE") {
    if (!env.ADMIN_TOKEN) {
      return json({ error: "Server misconfigured." }, 500);
    }
    if (request.headers.get("x-admin-token") !== env.ADMIN_TOKEN) {
      return json({ error: "Unauthorized." }, 401);
    }
    const removed = await deleteComment(env.DB, del[1]);
    return removed ? json({ ok: true }) : json({ error: "Not found." }, 404);
  }

  return json({ error: "Not found." }, 404);
}
