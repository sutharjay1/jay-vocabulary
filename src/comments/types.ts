// Mirrored by hand from the Comment type in worker/src/db.ts, which is not
// shared code — this repo and the Worker ship separately. That file's
// PUBLIC_COLUMNS constant is what decides the wire shape; if a column is
// dropped from it, this type must drop the field too, or nothing will catch
// the mismatch at compile time.
/** Mirrors the Worker's public column list — ip_hash is never sent. */
export type Comment = {
  id: string;
  set_slug: string;
  word_slug: string | null;
  author: string;
  body: string;
  created_at: number;
};
