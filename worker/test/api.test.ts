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
  });

  it("returns everything when unfiltered", async () => {
    const { comments } = (await (await call("/api/comments")).json()) as any;
    expect(comments).toHaveLength(4);
  });

  it("filters to one set, including its set-level comments", async () => {
    const { comments } = (await (
      await call("/api/comments?set=vocabulary-1")
    ).json()) as any;
    expect(comments).toHaveLength(3);
    expect(comments.every((c: any) => c.set_slug === "vocabulary-1")).toBe(true);
  });

  it("filters to one word", async () => {
    const { comments } = (await (
      await call("/api/comments?set=vocabulary-1&word=leverage")
    ).json()) as any;
    expect(comments).toHaveLength(1);
    expect(comments[0].body).toBe("one");
  });

  it("returns newest first", async () => {
    const { comments } = (await (await call("/api/comments")).json()) as any;
    const times = comments.map((c: any) => c.created_at);
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  it("returns an empty list for an unknown set rather than erroring", async () => {
    const response = await call("/api/comments?set=vocabulary-99");
    expect(response.status).toBe(200);
    expect(((await response.json()) as any).comments).toEqual([]);
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
});
