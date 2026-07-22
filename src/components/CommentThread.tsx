import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { COMMENTS_ENABLED, CommentError, listComments, postComment } from "../comments/api";
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

  const [open, setOpen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  /* Animating height is normally off-limits, but the sanctioned exception is a
     measured height on an overflow-hidden container — which is the only way to
     reveal a form without the comment list below it snapping down. The observer
     keeps the target honest as the textarea is dragged or an error appears. */
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const measure = () => setPanelHeight(el.scrollHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* The composer is the reason the button was pressed, so put the caret in it. */
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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
      setOpen(false);
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
      <div className="flex items-center justify-between gap-4">
        <h2 className={section}>Comments</h2>

        <button
          type="button"
          className={cn(
            "relative inline-flex h-8 flex-none items-center rounded-lg border border-border px-3",
            "text-[13px] font-semibold text-foreground",
            // The visible control is 32px; the pseudo-element takes the hit area to 44.
            "after:absolute after:-inset-[6px] after:content-['']",
            "transition-[border-color,transform,opacity] duration-150 ease-out-quint",
            "hover:border-border-strong active:scale-[0.97] motion-reduce:active:scale-100"
          )}
          aria-expanded={open}
          aria-controls="comment-composer"
          onClick={() => {
            // Cancelling keeps whatever was typed, so reopening does not lose it.
            setOpen((o) => !o);
            setError("");
          }}
        >
          {open ? "Cancel" : "Add comment"}
        </button>
      </div>

      <div
        id="comment-composer"
        className={cn(
          "overflow-hidden transition-[height] ease-out-quint motion-reduce:transition-none",
          // Exits run shorter than enters.
          open ? "duration-200" : "duration-150"
        )}
        style={{ height: open ? panelHeight : 0 }}
      >
        {/* inert keeps the collapsed form out of the tab order and off screen
            readers while staying measurable. */}
        <div
          ref={panelRef}
          inert={!open}
          className={cn(
            "pt-4 transition-opacity ease-out-quint",
            open ? "opacity-100 duration-200" : "opacity-0 duration-150"
          )}
        >
          <form onSubmit={submit}>
            <textarea
              ref={inputRef}
              className="block min-h-[84px] w-full resize-y rounded-[10px] border border-border px-3.5 py-3 text-[15px] text-foreground transition-colors duration-150 placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none"
              placeholder="A thought, or something that confused you…"
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
                disabled={sending || trimmedLength === 0 || over}
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
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="py-4 text-[15px] text-muted-foreground">Loading comments…</p>
        ) : (
          <CommentList comments={comments} showTarget={!word} />
        )}
      </div>
    </div>
  );
}
