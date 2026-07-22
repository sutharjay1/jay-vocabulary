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
