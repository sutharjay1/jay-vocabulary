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
