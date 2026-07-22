# vocab-comments

Cloudflare Worker backing the public comments on
[jay-vocabulary.vercel.app](https://jay-vocabulary.vercel.app). Comments live in
D1 (`vocab_comments`).

Live: `https://vocab-comments.sutharjay3635.workers.dev`

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/comments` | Every comment, newest first, max 200 |
| `GET` | `/api/comments?set=vocabulary-1` | One set, including its set-level comments |
| `GET` | `/api/comments?set=vocabulary-1&word=leverage` | One word |
| `POST` | `/api/comments` | `{ setSlug, wordSlug?, author?, body }` |
| `DELETE` | `/api/comments/:id` | Requires an `x-admin-token` header |

A `word` filter without a `set` is a 400: a word slug only means something
inside a set.

Body max 1000 characters. Author max 40; blank becomes `Anonymous`.
Rate limit: 5 posts per 10 minutes per hashed IP.

## What is never stored or returned

Raw IP addresses are never stored. `hashIp` keeps a salted SHA-256 only, and
`db.ts` selects an explicit column list so `ip_hash` cannot reach a response.

## Secrets

Both are set once and never committed. An empty value for either is treated as
a misconfiguration and returns 500 rather than degrading silently — an unsalted
hash would be reversible, and an empty admin token would leave delete
unauthenticated.

```bash
pnpm dlx wrangler secret put ADMIN_TOKEN   # authorises deletion
pnpm dlx wrangler secret put IP_SALT       # salts the IP hash
```

A copy of the admin token is at `worker/.admin-token.local` (mode 600,
gitignored). If it is lost, set a new one — existing comments are unaffected.

## Deleting a comment

```bash
curl -X DELETE https://vocab-comments.sutharjay3635.workers.dev/api/comments/<id> \
  -H "x-admin-token: $(cat worker/.admin-token.local)"
```

Find an id with `curl .../api/comments`.

## Commands

```bash
pnpm test          # vitest against real D1 via @cloudflare/vitest-pool-workers
pnpm typecheck     # tsc --noEmit
pnpm dev           # local worker
pnpm db:init       # apply schema.sql to the remote database
pnpm run deploy    # publish — note `run`; `deploy` is a reserved pnpm builtin
```

`schema.sql` is the single source of truth for the table. The tests import it
raw, so tests and production cannot drift.

## Known limits

- The rate limit counts rows, then inserts, in two statements. Simultaneous
  requests from one IP can each read the same stale count, so a burst can
  exceed 5. Closing it needs an atomic `INSERT ... SELECT` or a Durable Object
  per IP.
- Deleting a comment refunds that IP's allowance, because the window counts
  live rows. Moderating spam un-throttles the spammer.
- Comments are capped at 200 per response with no pagination.
