import type { Comment } from "./types";

const BASE = (import.meta.env.VITE_COMMENTS_API ?? "").replace(/\/$/, "");

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
