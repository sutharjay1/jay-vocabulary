import type { NewComment } from "./validate";

// Mirrored by hand in src/comments/types.ts, which the frontend imports
// instead of this file. Keep the two in step: if a column below stops being
// selected by PUBLIC_COLUMNS, that type must lose the field too, or the
// frontend will assert a field that no longer arrives with no type error.
export type Comment = {
  id: string;
  set_slug: string;
  word_slug: string | null;
  author: string;
  body: string;
  created_at: number;
};

/** Every column except ip_hash. The hash must never leave the Worker. This
    list is what decides the wire shape — it is the thing to change first,
    with the Comment type above (and its mirror in src/comments/types.ts)
    following. */
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

export async function deleteComment(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare(`DELETE FROM comments WHERE id = ?`).bind(id).run();
  return (result.meta.changes ?? 0) > 0;
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
