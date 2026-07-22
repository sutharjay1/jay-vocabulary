import { cn } from "@/lib/utils";
import type { Comment } from "../comments/types";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CommentList({
  comments,
  showTarget = false,
}: {
  comments: Comment[];
  showTarget?: boolean;
}) {
  if (comments.length === 0) {
    return <p className="py-4 text-[15px] text-muted-foreground">No notes yet.</p>;
  }

  return (
    <div className="border-t border-border">
      {comments.map((c) => (
        <article className="border-b border-border py-4" key={c.id}>
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="text-[13px] font-semibold text-foreground">{c.author}</span>
            <span className="text-[13px] tabular-nums text-muted-foreground">
              {relativeTime(c.created_at)}
            </span>
            {showTarget && (
              <span className={cn("text-[13px] text-muted-foreground")}>
                {c.word_slug ? `${c.set_slug} · ${c.word_slug}` : c.set_slug}
              </span>
            )}
          </div>
          <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground text-pretty">
            {c.body}
          </p>
        </article>
      ))}
    </div>
  );
}
