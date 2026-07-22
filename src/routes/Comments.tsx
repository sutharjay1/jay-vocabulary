import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { COMMENTS_ENABLED, listComments } from "../comments/api";
import type { Comment } from "../comments/types";
import CommentList from "../components/CommentList";
import { getSet } from "../sets";
import { controlLink, controls, title } from "../ui";

export default function Comments() {
  const { set: slug } = useParams();
  const set = slug ? getSet(slug) : undefined;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    setLoading(true);
    listComments(slug ? { set: slug } : {})
      .then((c) => live && setComments(c))
      .catch(() => live && setError("Could not load comments."))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [slug]);

  if (slug && !set) return <Navigate to="/" replace />;

  return (
    <>
      <h1 className={cn("mt-12", title)}>{set ? `${set.title} comments` : "All comments"}</h1>

      <div className={controls}>
        {set ? (
          <>
            <Link className={controlLink} to={`/${set.slug}`}>
              {set.title}
            </Link>
            <span className="text-border">·</span>
            <Link className={controlLink} to="/comments">
              All comments
            </Link>
          </>
        ) : (
          <Link className={controlLink} to="/">
            All sets
          </Link>
        )}
      </div>

      {!COMMENTS_ENABLED ? (
        <p className="text-[15px] text-muted-foreground">
          Comments are not configured for this deployment.
        </p>
      ) : loading ? (
        <p className="py-4 text-[15px] text-muted-foreground">Loading comments…</p>
      ) : error ? (
        <p className="py-4 text-[15px] text-foreground" role="alert">
          {error}
        </p>
      ) : (
        <CommentList comments={comments} showTarget />
      )}
    </>
  );
}
