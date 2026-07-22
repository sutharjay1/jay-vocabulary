import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CommentError, COMMENTS_ENABLED, listComments, postComment } from "../comments/api";
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
      setError(err instanceof CommentError ? err.message : "Could not post that comment.");
    } finally {
      setSending(false);
    }
  }

  // The Worker validates body.trim(), so a trailing newline must not count
  // against the limit here — otherwise the button can disable itself for text
  // the Worker would accept.
  const trimmedLength = body.trim().length;
  const over = trimmedLength > MAX_BODY;

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

          <span
            className="text-[13px] tabular-nums text-muted-foreground"
            aria-live={over ? "polite" : "off"}
          >
            {over
              ? `${trimmedLength - MAX_BODY} over the limit`
              : `${MAX_BODY - trimmedLength} left`}
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
          // A word-scoped thread needs no label: every row here shares that
          // word as its target. The set page has no word, so its rows span
          // several words and each needs to say which one.
          <CommentList comments={comments} showTarget={!word} />
        )}
      </div>
    </div>
  );
}
