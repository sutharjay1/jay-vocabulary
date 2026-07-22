/** Mirrors the Worker's public column list — ip_hash is never sent. */
export type Comment = {
  id: string;
  set_slug: string;
  word_slug: string | null;
  author: string;
  body: string;
  created_at: number;
};
