/** Statuses the Fetch spec forbids a body on. Constructing a Response that
    pairs one with a non-null body throws at construction time. */
const NULL_BODY_STATUS = new Set([204, 205, 304]);

export function corsHeaders(request: Request, allowed: string): Record<string, string> {
  const origin = request.headers.get("origin");
  const list = allowed.split(",").map((s) => s.trim()).filter(Boolean);

  /* Vary is unconditional: the response depends on Origin whether or not the
     origin matched, so a shared cache must key on it either way. Omitting it on
     the reject path lets a cache serve the header-less response to an allowed
     origin, or the CORS-bearing one to a stranger. */
  if (!origin || !list.includes(origin)) return { vary: "Origin" };

  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-token",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

export function withCors(response: Response, headers: Record<string, string>): Response {
  const merged = new Headers(response.headers);
  for (const [k, v] of Object.entries(headers)) merged.set(k, v);

  return new Response(NULL_BODY_STATUS.has(response.status) ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: merged,
  });
}
