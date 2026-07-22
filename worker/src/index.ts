export interface Env {
  DB: D1Database;
  ADMIN_TOKEN: string;
  IP_SALT: string;
  ALLOWED_ORIGINS: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/comments" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        `SELECT id, set_slug, word_slug, author, body, created_at
           FROM comments
          ORDER BY created_at DESC
          LIMIT 200`
      ).all();
      return Response.json({ comments: results });
    }

    return new Response("Not found", { status: 404 });
  },
};
