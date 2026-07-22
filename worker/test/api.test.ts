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

function post(body: unknown) {
  return call("/api/comments", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/comments", () => {
  it("stores a comment and returns it", async () => {
    const response = await post({
      setSlug: "vocabulary-1",
      wordSlug: "leverage",
      author: "Jay",
      body: "The lever image is what makes this stick.",
    });
    expect(response.status).toBe(201);
    const { comment } = (await response.json()) as any;
    expect(comment.set_slug).toBe("vocabulary-1");
    expect(comment.word_slug).toBe("leverage");
    expect(comment.author).toBe("Jay");
    expect(comment.body).toBe("The lever image is what makes this stick.");
    expect(typeof comment.id).toBe("string");
    expect(comment.created_at).toBeGreaterThan(0);
  });

  it("never returns the ip hash", async () => {
    await post({ setSlug: "vocabulary-1", wordSlug: null, author: "Jay", body: "note" });
    const { comments } = (await (await call("/api/comments")).json()) as any;
    expect(comments[0]).not.toHaveProperty("ip_hash");
  });

  it("defaults a blank author to Anonymous", async () => {
    const response = await post({
      setSlug: "vocabulary-1",
      wordSlug: null,
      author: "   ",
      body: "no name given",
    });
    const { comment } = (await response.json()) as any;
    expect(comment.author).toBe("Anonymous");
  });

  it("rejects an empty body", async () => {
    const response = await post({
      setSlug: "vocabulary-1",
      wordSlug: null,
      author: "Jay",
      body: "   \n  ",
    });
    expect(response.status).toBe(400);
    expect(((await response.json()) as any).error).toMatch(/empty/i);
  });

  it("rejects a body over 1000 characters", async () => {
    const response = await post({
      setSlug: "vocabulary-1",
      wordSlug: null,
      author: "Jay",
      body: "x".repeat(1001),
    });
    expect(response.status).toBe(400);
    expect(((await response.json()) as any).error).toMatch(/1000/);
  });

  it("rejects a missing set slug", async () => {
    const response = await post({ wordSlug: null, author: "Jay", body: "orphan" });
    expect(response.status).toBe(400);
  });

  it("truncates an over-long author to 40 characters", async () => {
    const response = await post({
      setSlug: "vocabulary-1",
      wordSlug: null,
      author: "y".repeat(80),
      body: "long name",
    });
    const { comment } = (await response.json()) as any;
    expect(comment.author).toHaveLength(40);
  });
});

describe("GET /api/comments validation", () => {
  it("rejects a word filter with no set, rather than returning everything", async () => {
    await post({ setSlug: "vocabulary-1", wordSlug: "leverage", author: "Jay", body: "kept" });
    await post({ setSlug: "vocabulary-2", wordSlug: "abate", author: "Jay", body: "other" });

    const response = await call("/api/comments?word=leverage");
    expect(response.status).toBe(400);
    expect(((await response.json()) as any).error).toMatch(/requires a set/i);
  });
});

describe("filtering", () => {
  beforeEach(async () => {
    await post({ setSlug: "vocabulary-1", wordSlug: "leverage", author: "Jay", body: "one" });
    await post({ setSlug: "vocabulary-1", wordSlug: "navigate", author: "Jay", body: "two" });
    await post({ setSlug: "vocabulary-1", wordSlug: null, author: "Jay", body: "set level" });
    await post({ setSlug: "vocabulary-2", wordSlug: "abate", author: "Tutor", body: "other set" });
    await post({ setSlug: "vocabulary-10", wordSlug: "decade", author: "Jay", body: "prefix trap" });
  });

  it("returns everything when unfiltered", async () => {
    const { comments } = (await (await call("/api/comments")).json()) as any;
    expect(comments).toHaveLength(5);
  });

  it("filters to one set, including its set-level comments", async () => {
    const { comments } = (await (
      await call("/api/comments?set=vocabulary-1")
    ).json()) as any;
    expect(comments).toHaveLength(3);
    expect(comments.every((c: any) => c.set_slug === "vocabulary-1")).toBe(true);
    expect(comments.some((c: any) => c.set_slug === "vocabulary-10")).toBe(false);
  });

  it("filters to one word", async () => {
    const { comments } = (await (
      await call("/api/comments?set=vocabulary-1&word=leverage")
    ).json()) as any;
    expect(comments).toHaveLength(1);
    expect(comments[0].body).toBe("one");
  });

  it("returns newest first", async () => {
    // Date.now() is coarsened in workerd, so seeded rows can share a timestamp
    // and a uniform array would sort to itself — proving nothing. Stamp
    // distinct times directly so this test can only pass on a real DESC sort.
    const rows = await env.DB.prepare("SELECT id FROM comments ORDER BY rowid").all<{ id: string }>();
    const ids = (rows.results ?? []).map((r) => r.id);
    expect(ids.length).toBeGreaterThan(2);

    const base = 1_000_000_000_000;
    for (let i = 0; i < ids.length; i++) {
      await env.DB.prepare("UPDATE comments SET created_at = ? WHERE id = ?")
        .bind(base + i * 1000, ids[i])
        .run();
    }

    const { comments } = (await (await call("/api/comments")).json()) as any;
    const times = comments.map((c: any) => c.created_at);
    expect(times).toHaveLength(ids.length);
    expect(times).toEqual([...times].sort((a: number, b: number) => b - a));
    // The last row stamped is the newest, so it must come first.
    expect(comments[0].created_at).toBe(base + (ids.length - 1) * 1000);
  });

  it("returns an empty list for an unknown set rather than erroring", async () => {
    const response = await call("/api/comments?set=vocabulary-99");
    expect(response.status).toBe(200);
    expect(((await response.json()) as any).comments).toEqual([]);
  });
});

describe("rate limiting", () => {
  it("allows five posts then rejects the sixth", async () => {
    for (let i = 0; i < 5; i++) {
      const ok = await post({
        setSlug: "vocabulary-1",
        wordSlug: null,
        author: "Jay",
        body: `note ${i}`,
      });
      expect(ok.status).toBe(201);
    }
    const blocked = await post({
      setSlug: "vocabulary-1",
      wordSlug: null,
      author: "Jay",
      body: "one too many",
    });
    expect(blocked.status).toBe(429);
    expect(((await blocked.json()) as any).error).toMatch(/too many/i);
  });

  it("does not count comments older than the window", async () => {
    for (let i = 0; i < 5; i++) {
      await post({ setSlug: "vocabulary-1", wordSlug: null, author: "Jay", body: `old ${i}` });
    }
    // Age every existing row past the 10-minute window.
    await env.DB.prepare("UPDATE comments SET created_at = created_at - ?")
      .bind(11 * 60 * 1000)
      .run();

    const allowed = await post({
      setSlug: "vocabulary-1",
      wordSlug: null,
      author: "Jay",
      body: "window has passed",
    });
    expect(allowed.status).toBe(201);
  });
});

describe("DELETE /api/comments/:id", () => {
  async function seed() {
    const response = await post({
      setSlug: "vocabulary-1",
      wordSlug: "leverage",
      author: "Jay",
      body: "delete me",
    });
    return ((await response.json()) as any).comment.id as string;
  }

  it("rejects a request with no token", async () => {
    const id = await seed();
    const response = await call(`/api/comments/${id}`, { method: "DELETE" });
    expect(response.status).toBe(401);
  });

  it("rejects a request with the wrong token", async () => {
    const id = await seed();
    const response = await call(`/api/comments/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": "nope" },
    });
    expect(response.status).toBe(401);
  });

  it("deletes with the right token", async () => {
    const id = await seed();
    const response = await call(`/api/comments/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": "test-admin-token" },
    });
    expect(response.status).toBe(200);

    const { comments } = (await (await call("/api/comments")).json()) as any;
    expect(comments).toHaveLength(0);
  });

  it("returns 404 for an id that does not exist", async () => {
    const response = await call("/api/comments/does-not-exist", {
      method: "DELETE",
      headers: { "x-admin-token": "test-admin-token" },
    });
    expect(response.status).toBe(404);
  });

  it("answers 401, not 404, for a nonexistent id with no token", async () => {
    // Pins the ordering: the token is checked before the row is looked up, so
    // an unauthenticated caller cannot tell a real id from an invented one.
    const response = await call("/api/comments/definitely-not-a-real-id", { method: "DELETE" });
    expect(response.status).toBe(401);
  });
});

describe("configuration", () => {
  it("refuses to store a comment when IP_SALT is missing", async () => {
    const original = env.IP_SALT;
    // Deliberately clearing a required binding for this test. `IP_SALT` is a
    // plain `string` in `Env`, so this assignment type-checks on its own —
    // no `@ts-expect-error` is needed or accepted by `tsc`.
    env.IP_SALT = "";
    try {
      const response = await post({
        setSlug: "vocabulary-1",
        wordSlug: null,
        author: "Jay",
        body: "should not be stored",
      });
      expect(response.status).toBe(500);
      const { comments } = (await (await call("/api/comments")).json()) as any;
      expect(comments).toHaveLength(0);
    } finally {
      env.IP_SALT = original;
    }
  });

  it("refuses to delete when ADMIN_TOKEN is empty, rather than accepting an empty header", async () => {
    const created = await post({
      setSlug: "vocabulary-1",
      wordSlug: null,
      author: "Jay",
      body: "must survive",
    });
    const { comment } = (await created.json()) as any;

    const original = env.ADMIN_TOKEN;
    env.ADMIN_TOKEN = "";
    try {
      const response = await call(`/api/comments/${comment.id}`, {
        method: "DELETE",
        headers: { "x-admin-token": "" },
      });
      expect(response.status).toBe(500);

      const { comments } = (await (await call("/api/comments")).json()) as any;
      expect(comments).toHaveLength(1);
    } finally {
      env.ADMIN_TOKEN = original;
    }
  });
});

describe("CORS", () => {
  it("echoes an allowed origin", async () => {
    const response = await call("/api/comments", {
      headers: { origin: "https://jay-vocabulary.vercel.app" },
    });
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "https://jay-vocabulary.vercel.app"
    );
  });

  it("does not echo an origin that is not allowed", async () => {
    const response = await call("/api/comments", {
      headers: { origin: "https://evil.example" },
    });
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("answers preflight", async () => {
    const response = await call("/api/comments", {
      method: "OPTIONS",
      headers: {
        origin: "http://localhost:5173",
        "access-control-request-method": "POST",
      },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-methods")).toContain("POST");
  });
});
