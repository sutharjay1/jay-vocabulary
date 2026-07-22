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
