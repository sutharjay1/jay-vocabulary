export const WINDOW_MS = 10 * 60 * 1000;
export const MAX_PER_WINDOW = 5;

/* A sliding window: every request looks back WINDOW_MS from its own arrival,
   so an allowance is never reset by the clock rolling over a bucket boundary.
   Two known limits, both accepted rather than overlooked:

   1. The count and the insert are separate statements, so simultaneous requests
      from one IP can each read the same stale count and all pass. A burst can
      therefore exceed MAX_PER_WINDOW. Closing this needs an atomic
      INSERT ... SELECT ... WHERE (SELECT COUNT(*) ...) < ?, or a Durable Object
      per IP for real serialisation — both are heavier than a two-person study
      site warrants. Revisit if the endpoint is ever publicised.

   2. The window counts live rows, so deleting a comment gives that IP its
      allowance back. Moderating spam therefore un-throttles the spammer rather
      than extending the block. Same trade: acceptable here, wrong at scale. */
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
