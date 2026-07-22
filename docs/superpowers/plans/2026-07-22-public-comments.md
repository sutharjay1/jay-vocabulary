# Public Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let anyone reading a word, a set, or the whole library leave a publicly visible note, stored in Cloudflare D1 and browsable at `/comments` and `/{set}/comments`.

**Architecture:** The site stays a static SPA on Vercel. A separate Cloudflare Worker in `worker/` owns a native D1 binding and exposes a small JSON API over CORS. No credential ever reaches the browser or the repo — the Worker talks to D1 through its binding, and the two secrets (`ADMIN_TOKEN`, `IP_SALT`) live in Wrangler secrets. The frontend reads `VITE_COMMENTS_API` at build time.

**Tech Stack:** Cloudflare Workers, Cloudflare D1 (SQLite), Wrangler 4, Vitest + `@cloudflare/vitest-pool-workers` (real D1 in tests), React 19, React Router 7, Tailwind v4.

## Global Constraints

- **Design system is fixed.** Black and white only. Arimo 500, `tracking-body`. Body copy `text-muted-foreground`; `text-foreground` is reserved for headings and key terms. No colour, no gradients, no badges, no emoji in the UI.
- **No hover leader lines.** The `leader` utility was deliberately removed from content pages. Do not reintroduce it.
- **Tokens only.** Use `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `border-border-strong`. Never a raw hex in a component.
- **Motion doctrine.** Transitions not keyframes. `ease-out-quint` for enter/exit. UI durations ≤ 300ms, exits ~75–80% of enters. Pressables get `active:scale-[0.97]`. Everything transform-based gets a `motion-reduce:` escape.
- **Class composition goes through `cn()`** from `@/lib/utils`.
- **Author default is `Jay`.** The name field is optional and free text; empty submits as `Anonymous`.
- **Comment body limit is 1000 characters.** Enforced in the Worker, not only the UI.
- **Rate limit is 5 posts per 10 minutes per hashed IP.** Raw IPs are never stored.
- **Commit messages carry no AI attribution** — no `Co-Authored-By`, no "Generated with", no session URL.
- **pnpm only.** Never npm.
- Node 22. Wrangler 4.113+.

## Prerequisites (human, once, before Task 1)

These need a browser and must be run by Jay, not by an agent. In the Claude Code session, prefix with `!` to run them inline:

```bash
! pnpm dlx wrangler login
```

Expect: browser opens, "Successfully logged in." No API token is created and nothing is pasted into the chat. If a headless token is ever needed instead, it must be scoped to `Account → D1 → Edit` and `Account → Workers Scripts → Edit`, and stored with `wrangler secret put`, never committed.

---

## File Structure

| Path | Responsibility |
|---|---|
| `worker/wrangler.toml` | Worker name, D1 binding, compatibility date |
| `worker/schema.sql` | The single source of truth for the `comments` table |
| `worker/src/index.ts` | Router: dispatches to handlers, applies CORS |
| `worker/src/db.ts` | Every SQL statement. Nothing else touches D1 |
| `worker/src/validate.ts` | Body/author validation and the IP hash |
| `worker/test/api.test.ts` | Worker integration tests against real D1 |
| `worker/vitest.config.ts` | Wires `@cloudflare/vitest-pool-workers` to `wrangler.toml` |
| `src/comments/api.ts` | Typed frontend client. The only place `fetch` is called |
| `src/comments/types.ts` | `Comment` shape, shared by client and views |
| `src/components/CommentThread.tsx` | Composer + list for one target. Used on word and set pages |
| `src/components/CommentList.tsx` | Presentational list of comments. No fetching |
| `src/routes/Comments.tsx` | `/comments` and `/{set}/comments` |
| `src/App.tsx` | Route table |
| `src/components/Chrome.tsx` | Rail and popover entries |

Split rationale: `db.ts` isolates SQL so a schema change touches one file. `CommentList` is presentational so `Comments.tsx` and `CommentThread.tsx` can both render comments without duplicating markup or re-fetching.

---

### Task 1: Worker scaffold, D1 database, and a failing test

**Files:**
- Create: `worker/package.json`
- Create: `worker/wrangler.toml`
- Create: `worker/schema.sql`
- Create: `worker/vitest.config.ts`
- Create: `worker/src/index.ts`
- Create: `worker/test/api.test.ts`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: nothing.
- Produces: `worker/src/index.ts` default export `{ fetch(request: Request, env: Env): Promise<Response> }`. `Env` is `{ DB: D1Database; ADMIN_TOKEN: string; IP_SALT: string; ALLOWED_ORIGINS: string }`.

- [ ] **Step 1: Create the Worker package**

`worker/package.json`:

```json
{
  "name": "vocab-comments",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "test": "vitest run",
    "db:init": "wrangler d1 execute vocab_comments --remote --file=./schema.sql",
    "db:init:local": "wrangler d1 execute vocab_comments --local --file=./schema.sql"
  },
  "devDependencies": {
    "@cloudflare/vitest-pool-workers": "^0.6.4",
    "@cloudflare/workers-types": "^4.20250109.0",
    "vitest": "~2.1.9",
    "wrangler": "^4.113.0"
  }
}
```

Note `vitest` is pinned to `~2.1.9` — `@cloudflare/vitest-pool-workers` 0.6.x does not support Vitest 3.

- [ ] **Step 2: Install**

```bash
cd worker && pnpm install
```

Expected: `wrangler`, `vitest`, `@cloudflare/vitest-pool-workers` resolve. No errors.

- [ ] **Step 3: Create the D1 database**

```bash
cd worker && pnpm dlx wrangler d1 create vocab_comments
```

Expected output contains a block like:

```
[[d1_databases]]
binding = "DB"
database_name = "vocab_comments"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copy that `database_id` — it goes in the next step. It is an identifier, not a secret, and is safe to commit.

- [ ] **Step 4: Write `worker/wrangler.toml`**

Replace `PASTE_DATABASE_ID_HERE` with the id from Step 3.

```toml
name = "vocab-comments"
main = "src/index.ts"
compatibility_date = "2026-07-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "vocab_comments"
database_id = "PASTE_DATABASE_ID_HERE"

[vars]
ALLOWED_ORIGINS = "https://jay-vocabulary.vercel.app,http://localhost:5173,http://localhost:4317"
```

`ADMIN_TOKEN` and `IP_SALT` are deliberately absent — they are set as secrets in Task 5 and Task 4.

- [ ] **Step 5: Write `worker/schema.sql`**

```sql
CREATE TABLE IF NOT EXISTS comments (
  id         TEXT    PRIMARY KEY,
  set_slug   TEXT    NOT NULL,
  word_slug  TEXT,
  author     TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  created_at INTEGER NOT NULL,
  ip_hash    TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_recent
  ON comments (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_set
  ON comments (set_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_word
  ON comments (set_slug, word_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_ratelimit
  ON comments (ip_hash, created_at DESC);
```

`word_slug` is nullable: `NULL` means the comment is on the set as a whole.

- [ ] **Step 6a: Write `worker/tsconfig.json`**

The root `tsconfig.json` only includes `src` and `vite.config.ts`, so the Worker needs its own. Without this, `D1Database` is an unknown type and the `?raw` import in the tests is an error in the editor.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["@cloudflare/workers-types", "@cloudflare/vitest-pool-workers"],
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "isolatedModules": true,
    "resolveJsonModule": true
  },
  "include": ["src", "test", "vitest.config.ts"]
}
```

- [ ] **Step 6b: Declare the raw SQL import**

`worker/src/env.d.ts`:

```ts
declare module "*.sql?raw" {
  const content: string;
  export default content;
}
```

This is what lets `worker/test/api.test.ts` import `schema.sql` as a string, so the tests build their tables from the same file production does and the two cannot drift.

- [ ] **Step 6c: Write `worker/vitest.config.ts`**

```ts
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
            ALLOWED_ORIGINS: "https://jay-vocabulary.vercel.app,http://localhost:5173",
          },
        },
      },
    },
  },
});
```

- [ ] **Step 6d: Type `env` for `cloudflare:test`**

`worker/test/env.d.ts`:

```ts
import type { Env } from "../src/index";

declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {}
}
```

`cloudflare:test` needs this `ProvidedEnv` augmentation so `env.DB` is typed instead of erroring with "Property 'DB' does not exist on type 'ProvidedEnv'".

- [ ] **Step 7: Write the failing test**

`worker/test/api.test.ts`:

```ts
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
```

- [ ] **Step 8: Run it to verify it fails**

```bash
cd worker && pnpm test
```

Expected: FAIL — `Cannot find module '../src/index'`.

- [ ] **Step 9: Write the minimal Worker**

`worker/src/index.ts`:

```ts
export interface Env {
  DB: D1Database;
  ADMIN_TOKEN: string;
  IP_SALT: string;
  ALLOWED_ORIGINS: string;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
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
```

- [ ] **Step 10: Run the test to verify it passes**

```bash
cd worker && pnpm test
```

Expected: PASS, 1 test.

- [ ] **Step 10a: Check the types resolve**

```bash
cd worker && pnpm typecheck
```

Expected: no output. A failure here usually means the `types` array in `worker/tsconfig.json` is wrong.

- [ ] **Step 11: Ignore Worker build output**

Append to the repo-root `.gitignore`:

```
worker/node_modules
worker/.wrangler
```

- [ ] **Step 12: Commit**

```bash
git add worker .gitignore
git commit -m "Add comments Worker scaffold with D1 and a passing GET

Worker owns a native D1 binding so no Cloudflare credential reaches the
frontend or the repo. schema.sql is the single source of truth for the table
and is imported raw by the tests, so the tests and production cannot drift."
```

---

### Task 2: POST a comment, with validation

**Files:**
- Create: `worker/src/validate.ts`
- Create: `worker/src/db.ts`
- Modify: `worker/src/index.ts`
- Modify: `worker/test/api.test.ts`

**Interfaces:**
- Consumes: `Env` from Task 1.
- Produces:
  - `validate.ts`: `validateComment(input: unknown): { ok: true; value: NewComment } | { ok: false; error: string }` where `NewComment = { setSlug: string; wordSlug: string | null; author: string; body: string }`.
  - `db.ts`: `insertComment(db: D1Database, c: NewComment & { ipHash: string }): Promise<Comment>` and `listComments(db: D1Database, filter: { setSlug?: string; wordSlug?: string }): Promise<Comment[]>`, where `Comment = { id: string; set_slug: string; word_slug: string | null; author: string; body: string; created_at: number }`.

- [ ] **Step 1: Write the failing tests**

Append to `worker/test/api.test.ts`:

```ts
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
```

A word slug is only meaningful inside a set — two sets can each have a word
called `leverage` — so a word-only filter is not a valid query and must be
rejected rather than silently dropping the `WHERE` clause. The `IP_SALT` test
overrides the binding that `vitest.config.ts` supplies for every other test,
via the `env` object imported from `cloudflare:test`.

- [ ] **Step 2: Run to verify they fail**

```bash
cd worker && pnpm test
```

Expected: FAIL — POST returns 404 because no POST branch exists, and the two
new describe blocks also fail (200/201 instead of 400/500) since their guards
don't exist yet.

- [ ] **Step 3: Write `worker/src/validate.ts`**

```ts
export type NewComment = {
  setSlug: string;
  wordSlug: string | null;
  author: string;
  body: string;
};

export const MAX_BODY = 1000;
export const MAX_AUTHOR = 40;

const SLUG = /^[a-z0-9-]{1,64}$/;

export function validateComment(
  input: unknown
): { ok: true; value: NewComment } | { ok: false; error: string } {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Expected a JSON object." };
  }
  const raw = input as Record<string, unknown>;

  const setSlug = typeof raw.setSlug === "string" ? raw.setSlug.trim() : "";
  if (!SLUG.test(setSlug)) {
    return { ok: false, error: "setSlug must be a lowercase slug." };
  }

  let wordSlug: string | null = null;
  if (typeof raw.wordSlug === "string" && raw.wordSlug.trim() !== "") {
    wordSlug = raw.wordSlug.trim();
    if (!SLUG.test(wordSlug)) {
      return { ok: false, error: "wordSlug must be a lowercase slug." };
    }
  }

  const body = typeof raw.body === "string" ? raw.body.trim() : "";
  if (body === "") {
    return { ok: false, error: "Comment cannot be empty." };
  }
  if (body.length > MAX_BODY) {
    return { ok: false, error: `Comment cannot be longer than ${MAX_BODY} characters.` };
  }

  const rawAuthor = typeof raw.author === "string" ? raw.author.trim() : "";
  const author = rawAuthor === "" ? "Anonymous" : [...rawAuthor].slice(0, MAX_AUTHOR).join("");

  return { ok: true, value: { setSlug, wordSlug, author, body } };
}

/** SHA-256 of salt + ip. The raw address is never stored or logged. */
export async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
```

`[...rawAuthor]` splits by Unicode code point rather than UTF-16 code unit, so
truncation cannot sever a surrogate pair (e.g. an emoji) straddling position
40.

- [ ] **Step 4: Write `worker/src/db.ts`**

```ts
import type { NewComment } from "./validate";

export type Comment = {
  id: string;
  set_slug: string;
  word_slug: string | null;
  author: string;
  body: string;
  created_at: number;
};

/** Every column except ip_hash. The hash must never leave the Worker. */
const PUBLIC_COLUMNS = "id, set_slug, word_slug, author, body, created_at";

export async function insertComment(
  db: D1Database,
  c: NewComment & { ipHash: string }
): Promise<Comment> {
  const row: Comment = {
    id: crypto.randomUUID(),
    set_slug: c.setSlug,
    word_slug: c.wordSlug,
    author: c.author,
    body: c.body,
    created_at: Date.now(),
  };
  await db
    .prepare(
      `INSERT INTO comments (id, set_slug, word_slug, author, body, created_at, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(row.id, row.set_slug, row.word_slug, row.author, row.body, row.created_at, c.ipHash)
    .run();
  return row;
}

export async function listComments(
  db: D1Database,
  filter: { setSlug?: string; wordSlug?: string } = {}
): Promise<Comment[]> {
  let sql = `SELECT ${PUBLIC_COLUMNS} FROM comments`;
  const binds: string[] = [];

  if (filter.setSlug && filter.wordSlug) {
    sql += ` WHERE set_slug = ? AND word_slug = ?`;
    binds.push(filter.setSlug, filter.wordSlug);
  } else if (filter.setSlug) {
    sql += ` WHERE set_slug = ?`;
    binds.push(filter.setSlug);
  }

  // id is a random UUID, not a sequence — this tiebreaker only makes ties
  // stable between identical queries, it does not mean "newest first" among them.
  sql += ` ORDER BY created_at DESC, id DESC LIMIT 200`;
  const { results } = await db.prepare(sql).bind(...binds).all<Comment>();
  return results ?? [];
}
```

`listComments` deliberately has no branch for `wordSlug` alone — a word slug
is only meaningful inside a set (two sets can each have a word called
`leverage`), so a word-only filter is not a valid query. Falling through to
the unfiltered `SELECT` for that case would silently return the whole table.
The guard lives in `index.ts` (Step 5 below), before this function is ever
called, so `listComments` itself never has to think about it.

- [ ] **Step 5: Rewrite `worker/src/index.ts` to route**

```ts
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
  async fetch(request: Request, env: Env): Promise<Response> {
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
```

The `wordSlug`-without-`setSlug` check 400s before `listComments` is ever
called, so the missing branch in `db.ts` never silently returns everything.
The `IP_SALT` check 500s before `hashIp` is called, so a missing secret can
never produce a stored, unsalted hash while still returning 201.

- [ ] **Step 6: Run the tests**

```bash
cd worker && pnpm test
```

Expected: PASS, 10 tests.

- [ ] **Step 7: Commit**

```bash
git add worker
git commit -m "Add POST /api/comments with validation

Body capped at 1000 chars and rejected when blank; author trimmed to 40 and
defaulted to Anonymous. The IP is hashed with a salt and stored only for rate
limiting — db.ts selects an explicit column list so ip_hash can never leak
into a response."
```

---

### Task 3: Filter comments by set and by word

**Files:**
- Modify: `worker/test/api.test.ts`

**Interfaces:**
- Consumes: `listComments` from Task 2 (already supports the filter).
- Produces: no new exports. This task proves the query behaviour and pins it with tests.

- [ ] **Step 1: Write the failing tests**

Append to `worker/test/api.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests**

```bash
cd worker && pnpm test
```

Expected: PASS. `listComments` already implements this; these tests exist to stop a later refactor from silently breaking the set/word split.

- [ ] **Step 3: Commit**

```bash
git add worker
git commit -m "Pin comment filtering behaviour with tests

Covers unfiltered, per-set (including set-level comments with a null word),
per-word, ordering, and the unknown-set case which must return an empty list
rather than a 404."
```

---

### Task 4: Rate limiting

**Files:**
- Create: `worker/src/ratelimit.ts`
- Modify: `worker/src/index.ts`
- Modify: `worker/test/api.test.ts`

**Interfaces:**
- Consumes: `Env`, `hashIp`.
- Produces: `isRateLimited(db: D1Database, ipHash: string, now: number): Promise<boolean>` — true when 5 or more comments already exist from that hash inside the last 10 minutes.

- [ ] **Step 1: Write the failing test**

Append to `worker/test/api.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify it fails**

```bash
cd worker && pnpm test
```

Expected: FAIL — the sixth post returns 201, not 429.

- [ ] **Step 3: Write `worker/src/ratelimit.ts`**

```ts
export const WINDOW_MS = 10 * 60 * 1000;
export const MAX_PER_WINDOW = 5;

export async function isRateLimited(
  db: D1Database,
  ipHash: string,
  now: number
): Promise<boolean> {
  const row = await db
    .prepare(`SELECT COUNT(*) AS n FROM comments WHERE ip_hash = ? AND created_at > ?`)
    .bind(ipHash, now - WINDOW_MS)
    .first<{ n: number }>();
  return (row?.n ?? 0) >= MAX_PER_WINDOW;
}
```

- [ ] **Step 4: Wire it into the POST branch**

In `worker/src/index.ts`, add the import:

```ts
import { isRateLimited } from "./ratelimit";
```

and insert this immediately after `const ipHash = await hashIp(ip, env.IP_SALT);`:

```ts
      if (await isRateLimited(env.DB, ipHash, Date.now())) {
        return json({ error: "Too many comments. Try again in a few minutes." }, 429);
      }
```

- [ ] **Step 5: Run the tests**

```bash
cd worker && pnpm test
```

Expected: PASS, 15 tests.

- [ ] **Step 6: Set the IP salt secret**

```bash
cd worker && pnpm dlx wrangler secret put IP_SALT
```

Paste a random 32-byte hex string when prompted. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Do not paste the value into chat, and do not commit it. Tests use the fake salt from `vitest.config.ts`.

- [ ] **Step 7: Commit**

```bash
git add worker
git commit -m "Rate limit comments to 5 per 10 minutes per hashed IP

Counted in D1 against the existing idx_comments_ratelimit index, so no KV or
Durable Object is needed. The window is checked on created_at, so old rows
stop counting rather than permanently burning an allowance."
```

---

### Task 5: Admin delete

**Files:**
- Modify: `worker/src/db.ts`
- Modify: `worker/src/index.ts`
- Modify: `worker/test/api.test.ts`

**Interfaces:**
- Consumes: `Env.ADMIN_TOKEN`.
- Produces: `deleteComment(db: D1Database, id: string): Promise<boolean>` — true when a row was removed.

- [ ] **Step 1: Write the failing tests**

Append to `worker/test/api.test.ts`:

```ts
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
```

Also add this into the existing `describe("configuration", ...)` block from Task 2, next
to the `IP_SALT` test it mirrors:

```ts
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
```

- [ ] **Step 2: Run to verify they fail**

```bash
cd worker && pnpm test
```

Expected: FAIL — DELETE returns 404 from the fallthrough for every case, so the 401 tests fail, and the
`ADMIN_TOKEN`-empty test fails too (200, not 500) since the guard doesn't exist yet.

- [ ] **Step 3: Add `deleteComment` to `worker/src/db.ts`**

```ts
export async function deleteComment(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare(`DELETE FROM comments WHERE id = ?`).bind(id).run();
  return (result.meta.changes ?? 0) > 0;
}
```

- [ ] **Step 4: Add the route to `worker/src/index.ts`**

Update the import:

```ts
import { deleteComment, insertComment, listComments } from "./db";
```

Add this branch before the final `return new Response("Not found", { status: 404 });`:

```ts
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
```

The token is compared before the lookup, so an unauthenticated caller cannot probe which ids exist.
`Headers.get()` returns `""` for a header sent with an empty value, not `null` — so without the
`!env.ADMIN_TOKEN` guard, an empty `ADMIN_TOKEN` binding paired with an empty `x-admin-token` header
would satisfy `"" !== ""` as `false` and slip past the comparison, making delete unauthenticated; the
guard above is required for that reason, not merely as defensive padding.

- [ ] **Step 5: Run the tests**

```bash
cd worker && pnpm test
```

Expected: PASS, 21 tests.

- [ ] **Step 6: Set the admin token secret**

```bash
cd worker && pnpm dlx wrangler secret put ADMIN_TOKEN
```

Generate the value with the same `randomBytes` command as Task 4 Step 6. Store it in a password manager — it is the only way to delete a comment.

- [ ] **Step 7: Commit**

```bash
git add worker
git commit -m "Add token-guarded comment deletion

The admin token is compared before the row lookup so an unauthenticated
caller cannot use response codes to discover which comment ids exist."
```

---

### Task 6: CORS, preflight, and first deploy

**Files:**
- Create: `worker/src/cors.ts`
- Modify: `worker/src/index.ts`
- Modify: `worker/test/api.test.ts`

**Interfaces:**
- Consumes: `Env.ALLOWED_ORIGINS`.
- Produces: `corsHeaders(request: Request, allowed: string): Record<string, string>` and `withCors(response: Response, headers: Record<string, string>): Response`.

- [ ] **Step 1: Write the failing tests**

Append to `worker/test/api.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify they fail**

```bash
cd worker && pnpm test
```

Expected: FAIL — no CORS headers are set, and OPTIONS returns 404.

- [ ] **Step 3: Write `worker/src/cors.ts`**

```ts
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
```

The allowlist is explicit — a wildcard would let any site post on the reader's behalf. `Vary: Origin` is set on every path, including the reject path, so a shared cache cannot serve the wrong response to the wrong origin. `withCors` nulls the body on statuses the Fetch spec forbids one on (204/205/304) — otherwise constructing the `Response` throws.

- [ ] **Step 4: Wrap every response in `worker/src/index.ts`**

Add the import:

```ts
import { corsHeaders, withCors } from "./cors";
```

Restructure `fetch` so the routing lives in a helper and every exit goes through `withCors`, wrapped in a try/catch so a crash still carries CORS headers instead of surfacing to the browser as an opaque CORS failure:

```ts
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
  // ...the existing GET / POST / DELETE / 404 body, unchanged...
}
```

- [ ] **Step 5: Run the tests**

```bash
cd worker && pnpm test
```

Expected: PASS, 29 tests.

- [ ] **Step 6: Initialise the remote database**

```bash
cd worker && pnpm db:init
```

Expected: `Executed 5 commands`. Verify:

```bash
cd worker && pnpm dlx wrangler d1 execute vocab_comments --remote \
  --command "SELECT name FROM sqlite_master WHERE type='table'"
```

Expected: a row for `comments`.

- [ ] **Step 7: Deploy**

`deploy` is a reserved pnpm builtin, so `pnpm deploy` runs pnpm's own command and fails with `ERR_PNPM_CANNOT_DEPLOY`. It must be `pnpm run deploy`.

```bash
cd worker && pnpm run deploy
```

Expected output includes the deployed URL, e.g. `https://vocab-comments.<subdomain>.workers.dev`. **Record that URL — Task 7 needs it.**

- [ ] **Step 8: Verify the live Worker**

```bash
W=https://vocab-comments.<subdomain>.workers.dev
curl -s "$W/api/comments"
curl -s -X POST "$W/api/comments" -H 'content-type: application/json' \
  -d '{"setSlug":"vocabulary-1","wordSlug":"leverage","author":"Jay","body":"first live note"}'
curl -s "$W/api/comments?set=vocabulary-1&word=leverage"
```

Expected: `{"comments":[]}`, then a 201 with the created comment, then that comment in the filtered list.

- [ ] **Step 9: Commit**

```bash
git add worker
git commit -m "Add an explicit CORS allowlist and deploy the Worker

Origins are echoed only when they appear in ALLOWED_ORIGINS. A wildcard would
let any page post comments using a reader's connection, so the list is
explicit and Vary: Origin is set for caches."
```

---

### Task 7: Typed frontend client

**Files:**
- Create: `src/comments/types.ts`
- Create: `src/comments/api.ts`
- Create: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Consumes: the deployed Worker URL from Task 6 Step 7.
- Produces:
  - `types.ts`: `type Comment = { id: string; set_slug: string; word_slug: string | null; author: string; body: string; created_at: number }`.
  - `api.ts`: `listComments(filter?: { set?: string; word?: string }): Promise<Comment[]>`, `postComment(input: { set: string; word?: string | null; author: string; body: string }): Promise<Comment>`, and `COMMENTS_ENABLED: boolean`.

- [ ] **Step 1: Write `src/comments/types.ts`**

```ts
/** Mirrors the Worker's public column list — ip_hash is never sent. */
export type Comment = {
  id: string;
  set_slug: string;
  word_slug: string | null;
  author: string;
  body: string;
  created_at: number;
};
```

- [ ] **Step 2: Write `src/comments/api.ts`**

```ts
import type { Comment } from "./types";

/* Trim before testing for emptiness, or a value of " " counts as configured and
   every request goes to a garbage base. Strip all trailing slashes, not one —
   the Worker matches url.pathname exactly, so "//api/comments" 404s. */
const BASE = (import.meta.env.VITE_COMMENTS_API ?? "").trim().replace(/\/+$/, "");

/** With no API configured the UI hides the comment surfaces entirely rather
    than rendering a box that always fails. */
export const COMMENTS_ENABLED = BASE !== "";

export class CommentError extends Error {}

async function readError(response: Response): Promise<never> {
  let message = `Request failed (${response.status}).`;
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) message = data.error;
  } catch {
    /* keep the status-code message */
  }
  throw new CommentError(message);
}

export async function listComments(
  filter: { set?: string; word?: string } = {}
): Promise<Comment[]> {
  if (!COMMENTS_ENABLED) return [];
  const params = new URLSearchParams();
  if (filter.set) params.set("set", filter.set);
  if (filter.word) params.set("word", filter.word);
  const query = params.toString();

  const response = await fetch(`${BASE}/api/comments${query ? `?${query}` : ""}`);
  if (!response.ok) return readError(response);
  const data = (await response.json()) as { comments: Comment[] };
  return data.comments;
}

export async function postComment(input: {
  set: string;
  word?: string | null;
  author: string;
  body: string;
}): Promise<Comment> {
  if (!COMMENTS_ENABLED) {
    throw new CommentError("Comments are not configured for this deployment.");
  }
  const response = await fetch(`${BASE}/api/comments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      setSlug: input.set,
      wordSlug: input.word ?? null,
      author: input.author,
      body: input.body,
    }),
  });
  if (!response.ok) return readError(response);
  const data = (await response.json()) as { comment: Comment };
  return data.comment;
}
```

- [ ] **Step 3: Create `.env.example`**

```
# Deployed comments Worker. Without it the comment UI is hidden.
VITE_COMMENTS_API=https://vocab-comments.<subdomain>.workers.dev
```

- [ ] **Step 4: Create the local env file**

```bash
printf 'VITE_COMMENTS_API=https://vocab-comments.<subdomain>.workers.dev\n' > .env.local
```

`.env.local` is already matched by the existing `*.local` line in `.gitignore` — confirm with `git check-ignore -v .env.local`, which must print the matching rule.

- [ ] **Step 5: Add the same variable to Vercel**

```bash
vercel env add VITE_COMMENTS_API production
```

Paste the Worker URL when prompted. Repeat for `preview` and `development`. This is a public URL, not a secret — the secrets stay in Wrangler.

- [ ] **Step 6: Verify the build picks it up**

```bash
pnpm build && grep -c "workers.dev" dist/assets/*.js
```

Expected: at least `1`. If `0`, the env var did not reach the build — check the file is `.env.local` at the repo root and the name starts with `VITE_`.

- [ ] **Step 7: Document it in `README.md`**

Add under `## Develop`:

```markdown
### Comments

Comments are served by a Cloudflare Worker in `worker/`, backed by D1. The
frontend needs one variable:

```
VITE_COMMENTS_API=https://vocab-comments.<subdomain>.workers.dev
```

Without it the comment surfaces are hidden and the rest of the site works
unchanged. Worker secrets (`ADMIN_TOKEN`, `IP_SALT`) live in Wrangler and are
never committed. See `worker/README.md` for deploys.
```

- [ ] **Step 8: Commit**

```bash
git add src/comments .env.example README.md
git commit -m "Add the typed comments client

COMMENTS_ENABLED is false when VITE_COMMENTS_API is unset, so a fork without
a Worker renders the site unchanged instead of showing a box that always
fails. The client is the only place fetch is called."
```

---

### Task 8: The comment thread on a word page

**Files:**
- Create: `src/components/CommentList.tsx`
- Create: `src/components/CommentThread.tsx`
- Modify: `src/routes/Words.tsx`

**Interfaces:**
- Consumes: `listComments`, `postComment`, `COMMENTS_ENABLED`, `Comment`.
- Produces:
  - `CommentList.tsx`: `export default function CommentList({ comments, showTarget }: { comments: Comment[]; showTarget?: boolean })`.
  - `CommentThread.tsx`: `export default function CommentThread({ set, word }: { set: string; word?: string | null })`.
  - `relativeTime(ms: number): string` exported from `CommentList.tsx`.

- [ ] **Step 1: Write `src/components/CommentList.tsx`**

```tsx
import { cn } from "@/lib/utils";
import type { Comment } from "../comments/types";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CommentList({
  comments,
  showTarget = false,
}: {
  comments: Comment[];
  showTarget?: boolean;
}) {
  if (comments.length === 0) {
    return <p className="py-4 text-[15px] text-muted-foreground">No comments yet.</p>;
  }

  return (
    <div className="border-t border-border">
      {comments.map((c) => (
        <article className="border-b border-border py-4" key={c.id}>
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="text-[13px] font-semibold text-foreground">{c.author}</span>
            <span className="text-[13px] tabular-nums text-muted-foreground">
              {relativeTime(c.created_at)}
            </span>
            {showTarget && (
              <span className={cn("text-[13px] text-muted-foreground")}>
                {c.word_slug ? `${c.set_slug} · ${c.word_slug}` : c.set_slug}
              </span>
            )}
          </div>
          <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground text-pretty">
            {c.body}
          </p>
        </article>
      ))}
    </div>
  );
}
```

`whitespace-pre-wrap` preserves the line breaks someone types. React escapes the text, so no HTML in a comment can execute.

- [ ] **Step 2: Write `src/components/CommentThread.tsx`**

```tsx
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { COMMENTS_ENABLED, listComments, postComment } from "../comments/api";
import type { Comment } from "../comments/types";
import { section } from "../ui";
import CommentList from "./CommentList";

const MAX_BODY = 1000;
const NAME_KEY = "vocab:comment-author";

export default function CommentThread({ set, word }: { set: string; word?: string | null }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState("Jay");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAuthor(localStorage.getItem(NAME_KEY) ?? "Jay");
  }, []);

  useEffect(() => {
    let live = true;
    setLoading(true);
    listComments({ set, word: word ?? undefined })
      .then((c) => live && setComments(c))
      .catch(() => live && setError("Could not load comments."))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [set, word]);

  if (!COMMENTS_ENABLED) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim() === "" || sending) return;
    setSending(true);
    setError("");
    try {
      const created = await postComment({ set, word, author, body });
      setComments((prev) => [created, ...prev]);
      setBody("");
      localStorage.setItem(NAME_KEY, author);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post that comment.");
    } finally {
      setSending(false);
    }
  }

  const over = body.length > MAX_BODY;

  return (
    <div className="mt-14">
      <h2 className={section}>Comments</h2>

      <form className="mt-3" onSubmit={submit}>
        <textarea
          className="block min-h-[84px] w-full resize-y rounded-[10px] border border-border px-3.5 py-3 text-[15px] text-foreground transition-colors duration-150 placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none"
          placeholder="Add a comment — a thought, or something that confused you…"
          aria-label="Your comment"
          value={body}
          maxLength={MAX_BODY + 200}
          onChange={(e) => setBody(e.target.value)}
        />

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <input
            className="h-10 w-36 rounded-lg border border-border px-3 text-[15px] text-foreground transition-colors duration-150 placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none"
            aria-label="Your name"
            placeholder="Name"
            value={author}
            maxLength={40}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <button
            className={cn(
              "inline-flex min-h-10 items-center justify-center rounded-lg border border-foreground bg-foreground px-[18px]",
              "text-[15px] font-semibold text-background",
              "transition-[transform,opacity] duration-150 ease-out-quint",
              "hover:opacity-[0.86] active:scale-[0.97] motion-reduce:active:scale-100",
              "disabled:cursor-default disabled:opacity-35 disabled:hover:opacity-35 disabled:active:scale-100"
            )}
            type="submit"
            disabled={sending || body.trim() === "" || over}
          >
            {sending ? "Posting…" : "Post comment"}
          </button>

          <span className="text-[13px] tabular-nums text-muted-foreground" aria-live="polite">
            {over ? `${body.length - MAX_BODY} over the limit` : `${MAX_BODY - body.length} left`}
          </span>
        </div>

        {error && (
          <p className="mt-2.5 text-[13px] text-foreground" role="alert">
            {error}
          </p>
        )}
      </form>

      <div className="mt-8">
        {loading ? (
          <p className="py-4 text-[15px] text-muted-foreground">Loading comments…</p>
        ) : (
          <CommentList comments={comments} />
        )}
      </div>
    </div>
  );
}
```

The counter reads "N left" and flips to "N over the limit", so the limit is visible before the Worker rejects it.

- [ ] **Step 3: Mount it on the word page**

In `src/routes/Words.tsx`, add the import:

```tsx
import CommentThread from "../components/CommentThread";
```

Then, inside the single-word return, insert `<CommentThread set={set.slug} word={word.slug} />` between the Note block (the word's own usage note — a separate, pre-existing feature) and the prev/next footer — that is, immediately after the `</div>` closing the Note block and before the `<div className="mt-12 flex items-center justify-between ...">` element.

- [ ] **Step 4: Build and check by hand**

```bash
pnpm build && pnpm preview --port 4317 --strictPort
```

Open `http://localhost:4317/vocabulary-1/words?w=leverage`. Expected: a **Comments** heading below the Note section, a textarea, a name field pre-filled with `Jay`, a disabled **Post comment** button, and the live comment from Task 6 Step 8. Type a comment and post it — it must appear at the top of the list without a page reload.

- [ ] **Step 5: Commit**

```bash
git add src/components/CommentList.tsx src/components/CommentThread.tsx src/routes/Words.tsx
git commit -m "Add a comments thread to the word page

The composer posts optimistically into local state so a comment appears
without a refetch. Comment bodies render with whitespace-pre-wrap through
React's normal escaping, so typed markup is shown as text rather than
parsed."
```

---

### Task 9: The comment thread on the set page

**Files:**
- Modify: `src/routes/SetOverview.tsx`

**Interfaces:**
- Consumes: `CommentThread` from Task 8.
- Produces: nothing new.

- [ ] **Step 1: Mount the thread**

In `src/routes/SetOverview.tsx`, add the import:

```tsx
import CommentThread from "../components/CommentThread";
```

Insert `<CommentThread set={set.slug} />` immediately after the second CTA paragraph (the "Take the quiz" one) and before the closing `</>`.

Omitting `word` posts a set-level comment, which the Worker stores with `word_slug = NULL`.

- [ ] **Step 2: Build and check by hand**

```bash
pnpm build && pnpm preview --port 4317 --strictPort
```

Open `http://localhost:4317/vocabulary-1`. Expected: a **Comments** section at the bottom. Post a comment. It must appear here but **not** on `/vocabulary-1/words?w=leverage`, because that page filters to `word=leverage`.

- [ ] **Step 3: Commit**

```bash
git add src/routes/SetOverview.tsx
git commit -m "Add a comments thread to the set page

Set-level comments are stored with a null word_slug, so they appear on the
set page and in the set's comment listing but not under an individual word."
```

---

### Task 10: The `/comments` and `/{set}/comments` listings

**Files:**
- Create: `src/routes/Comments.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Chrome.tsx`
- Modify: `src/components/icons.tsx`

**Interfaces:**
- Consumes: `listComments`, `CommentList`, `getSet`, `SETS`.
- Produces: `Comments.tsx` default export, rendered by both routes; it reads the optional `:set` param to decide its scope.

- [ ] **Step 1: Add a speech-bubble icon**

Append to `src/components/icons.tsx`:

```tsx
export const IconComment = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H9l-4 3.5V6.5A2.5 2.5 0 0 1 7.5 4h10A2.5 2.5 0 0 1 20 6.5z" />
  </svg>
);
```

- [ ] **Step 2: Write `src/routes/Comments.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { COMMENTS_ENABLED, listComments } from "../comments/api";
import type { Comment } from "../comments/types";
import CommentList from "../components/CommentList";
import { getSet } from "../sets";
import { controlLink, controls, title } from "../ui";

export default function Comments() {
  const { set: slug } = useParams();
  const set = slug ? getSet(slug) : undefined;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    setLoading(true);
    listComments(slug ? { set: slug } : {})
      .then((c) => live && setComments(c))
      .catch(() => live && setError("Could not load comments."))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [slug]);

  if (slug && !set) return <Navigate to="/" replace />;

  return (
    <>
      <h1 className={cn("mt-12", title)}>{set ? `${set.title} comments` : "All comments"}</h1>

      <div className={controls}>
        {set ? (
          <>
            <Link className={controlLink} to={`/${set.slug}`}>
              {set.title}
            </Link>
            <span className="text-border">·</span>
            <Link className={controlLink} to="/comments">
              All comments
            </Link>
          </>
        ) : (
          <Link className={controlLink} to="/">
            All sets
          </Link>
        )}
      </div>

      {!COMMENTS_ENABLED ? (
        <p className="text-[15px] text-muted-foreground">
          Comments are not configured for this deployment.
        </p>
      ) : loading ? (
        <p className="py-4 text-[15px] text-muted-foreground">Loading comments…</p>
      ) : error ? (
        <p className="py-4 text-[15px] text-foreground" role="alert">
          {error}
        </p>
      ) : (
        <CommentList comments={comments} showTarget />
      )}
    </>
  );
}
```

`showTarget` is on here because a listing spans several words, so each comment has to say what it is about.

- [ ] **Step 3: Register both routes in `src/App.tsx`**

Add the import:

```tsx
import Comments from "./routes/Comments";
```

Add these two routes inside `<Routes>`, with `/comments` **above** `/:set` so the static segment is matched first:

```tsx
          <Route path="/comments" element={<Comments />} />
          <Route path="/:set/comments" element={<Comments />} />
```

React Router 7 ranks static segments above dynamic ones regardless of order, but keeping `/comments` first makes the intent obvious to a reader.

- [ ] **Step 4: Extend the document title in `src/App.tsx`**

In the `Head` component, replace the title expression with:

```tsx
    document.title = !set
      ? leaf === undefined && pathname === "/comments"
        ? "All comments"
        : "Vocabulary — every set"
      : leaf === "quiz"
        ? `Quiz · ${set.title}`
        : leaf === "comments"
          ? `Comments · ${set.title}`
          : leaf === "words"
            ? `The words · ${set.title}`
            : `${set.title} — ${set.theme}`;
```

Note `/comments` has `slug === "comments"`, which `getSet` does not resolve, so `set` is undefined and the first branch handles it.

- [ ] **Step 5: Add rail and popover entries in `src/components/Chrome.tsx`**

Add `IconComment` to the icons import. In `useItems`, in the **no-set** branch, append after the `SETS.map(...)` result:

```tsx
    return [
      ...SETS.map((s) => ({
        href: `/${s.slug}`,
        label: s.title,
        mark: <IconDoc className="block h-3.5 w-3.5" />,
      })),
      {
        href: "/comments",
        label: "All comments",
        mark: <IconComment className="block h-3.5 w-3.5" />,
        sep: true,
      },
    ];
```

In the **set** branch, insert this entry immediately after the `Quiz` entry and before the `All sets` entry:

```tsx
  items.push({
    href: `/${set.slug}/comments`,
    label: "Comments",
    mark: <IconComment className="block h-3.5 w-3.5" />,
  });
```

- [ ] **Step 6: Teach `useCurrent` about the new route**

In `src/components/Chrome.tsx`, inside `useCurrent`, add this line immediately before the `if (pathname === \`/${set.slug}/quiz\`)` check:

```tsx
  if (pathname === `/${set.slug}/comments`) return `/${set.slug}/comments`;
```

and change the no-set early return to:

```tsx
  if (!set) return pathname === "/" ? "" : pathname;
```

which already returns `/comments` unchanged for the all-comments route.

- [ ] **Step 7: Build and check by hand**

```bash
pnpm build && pnpm preview --port 4317 --strictPort
```

Check all of:
- `http://localhost:4317/comments` — every comment, each labelled with its set and word
- `http://localhost:4317/vocabulary-1/comments` — only that set's comments
- `http://localhost:4317/vocabulary-99/comments` — redirects to `/`
- The rail shows **Comments** inside a set and **All comments** on `/`

- [ ] **Step 8: Commit**

```bash
git add src/routes/Comments.tsx src/App.tsx src/components/Chrome.tsx src/components/icons.tsx
git commit -m "Add /comments and /:set/comments listings

One component serves both routes and switches scope on the presence of the
set param. Listings pass showTarget so each comment says which word it
belongs to, which a single word's thread does not need."
```

---

### Task 11: End-to-end verification and deploy

**Files:**
- Create: `worker/README.md`
- Modify: `vercel.json`

**Interfaces:**
- Consumes: everything above.
- Produces: a deployed site with working comments.

- [ ] **Step 1: Confirm the SPA rewrite still covers the new routes**

Read `vercel.json`. The rule is:

```json
{ "source": "/((?!assets/).*)", "destination": "/index.html" }
```

This already matches `/comments` and `/vocabulary-1/comments`, so **no change is needed**. Confirm by reading the file; do not edit it.

- [ ] **Step 2: Write the end-to-end check**

Create `/private/tmp/claude-501/.../scratchpad/drive-comments.mjs` (or any scratch path):

```js
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:4317";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 1400 } });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e)));
const fail = [];
const check = (label, got, want) => {
  const ok = got === want;
  if (!ok) fail.push(`${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  console.log(`${ok ? "ok   " : "FAIL "} ${label}: ${got}`);
};

const stamp = `e2e ${Date.now()}`;

await p.goto(`${BASE}/vocabulary-1/words?w=leverage`, { waitUntil: "networkidle" });
check("thread renders", await p.getByRole("heading", { name: "Comments" }).isVisible(), true);
check("name defaults to Jay", await p.getByLabel("Your name").inputValue(), "Jay");
check("post disabled while empty", await p.getByRole("button", { name: "Post comment" }).isDisabled(), true);

await p.getByLabel("Your comment").fill(stamp);
check("post enabled with text", await p.getByRole("button", { name: "Post comment" }).isDisabled(), false);
await p.getByRole("button", { name: "Post comment" }).click();
await p.waitForTimeout(1200);
check("comment appears without reload", (await p.locator("article").first().innerText()).includes(stamp), true);

await p.reload({ waitUntil: "networkidle" });
await p.waitForTimeout(800);
check("comment survives a reload", (await p.locator("main").innerText()).includes(stamp), true);

await p.goto(`${BASE}/vocabulary-1/comments`, { waitUntil: "networkidle" });
await p.waitForTimeout(800);
check("shows in the set listing", (await p.locator("main").innerText()).includes(stamp), true);

await p.goto(`${BASE}/comments`, { waitUntil: "networkidle" });
await p.waitForTimeout(800);
check("shows in the all-comments listing", (await p.locator("main").innerText()).includes(stamp), true);
check("listing labels the target", (await p.locator("main").innerText()).includes("leverage"), true);

await p.goto(`${BASE}/vocabulary-1/quiz`, { waitUntil: "networkidle" });
check("quiz still works", await p.locator('[role="radio"]').count(), 8);

console.log(errors.length ? "\nPAGE ERRORS:\n" + errors.join("\n") : "\nno page errors");
console.log(fail.length ? `\n${fail.length} FAILURES:\n` + fail.join("\n") : "\nall assertions passed");
await b.close();
process.exit(fail.length || errors.length ? 1 : 0);
```

- [ ] **Step 3: Run it against the local preview**

```bash
pnpm build && pnpm preview --port 4317 --strictPort &
sleep 3 && node <scratch>/drive-comments.mjs
```

Expected: all assertions pass, no page errors.

- [ ] **Step 4: Write `worker/README.md`**

```markdown
# vocab-comments

Cloudflare Worker backing the public comments on jay-vocabulary.vercel.app.
Stores comments in D1 (`vocab_comments`).

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/comments` | All comments, newest first, max 200 |
| GET | `/api/comments?set=vocabulary-1` | One set, including its set-level comments |
| GET | `/api/comments?set=vocabulary-1&word=leverage` | One word |
| POST | `/api/comments` | `{ setSlug, wordSlug?, author?, body }` |
| DELETE | `/api/comments/:id` | Requires `x-admin-token` |

Body max 1000 chars. Author max 40, blank becomes `Anonymous`.
Rate limit: 5 posts per 10 minutes per hashed IP. Raw IPs are never stored.

## Secrets

Set once, never committed:

```bash
pnpm dlx wrangler secret put ADMIN_TOKEN   # to delete comments
pnpm dlx wrangler secret put IP_SALT       # salts the IP hash
```

## Deleting a comment

```bash
curl -X DELETE https://vocab-comments.<subdomain>.workers.dev/api/comments/<id> \
  -H "x-admin-token: $ADMIN_TOKEN"
```

## Commands

```bash
pnpm test            # vitest against real D1 via workers pool
pnpm dev             # local worker
pnpm db:init         # apply schema.sql to the remote database
pnpm run deploy          # publish
```
```

- [ ] **Step 5: Deploy both halves**

```bash
cd worker && pnpm run deploy && cd ..
DEP=$(vercel deploy --prod --yes 2>&1 | grep -oE 'jay-vocabulary-[a-z0-9]+-sutharjay\.vercel\.app' | head -1)
vercel alias set "$DEP" jay-vocabulary.vercel.app
```

The alias step is required — `--prod` alone does not move the clean URL.

- [ ] **Step 6: Verify against production**

```bash
BASE=https://jay-vocabulary.vercel.app node <scratch>/drive-comments.mjs
for p in / /vocabulary-1 /vocabulary-1/words /vocabulary-1/quiz /comments /vocabulary-1/comments; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' "https://jay-vocabulary.vercel.app$p")  $p"
done
```

Expected: all assertions pass, and every route returns `200`.

- [ ] **Step 7: Delete the end-to-end test comments**

The e2e run leaves `e2e <timestamp>` comments in the live database. Remove them:

```bash
cd worker && pnpm dlx wrangler d1 execute vocab_comments --remote \
  --command "DELETE FROM comments WHERE body LIKE 'e2e %'"
```

Verify with `--command "SELECT COUNT(*) FROM comments"`.

- [ ] **Step 8: Commit**

```bash
git add worker/README.md
git commit -m "Document the comments Worker and verify end to end

Covers the endpoint table, both secrets, the delete recipe, and the fact that
raw IPs are never stored — only a salted hash used for rate limiting."
```

---

## What this plan does not do

Called out so nobody assumes otherwise:

- **No edit.** A posted note can be deleted with the admin token, not edited.
- **No threading.** Notes are a flat list per target; there are no replies.
- **No pagination.** The Worker caps at 200 rows. Past that, add a cursor on `created_at`.
- **No spam filtering beyond the rate limit.** A determined poster with rotating IPs gets through. Acceptable for two known users; revisit if the URL spreads.
- **The rate limit is not race-proof.** The count and the insert are separate statements, so simultaneous requests from one IP can each read the same stale count and all pass. A burst can exceed 5. Closing it needs an atomic `INSERT ... SELECT ... WHERE (SELECT COUNT(*) ...) < ?` or a Durable Object per IP.
- **Deleting a comment refunds its author's rate-limit allowance**, because the window counts live rows. Moderating spam un-throttles the spammer instead of extending the block.
- **No live updates.** Another person's note appears on your next load, not in real time.
- **The name is unverified.** Anyone can type `Jay`. There is no auth, by choice.
