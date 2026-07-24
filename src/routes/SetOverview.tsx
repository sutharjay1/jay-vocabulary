import { Link, Navigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getSet, examplesIn, isGrammar, synonymsIn, questionsIn, scoredIn } from "../sets";
import CommentThread from "../components/CommentThread";
import DocMeta from "../components/DocMeta";
import Prose from "../components/Prose";
import GuideOverview from "./GuideOverview";
import {
  block,
  ctaArrow,
  ctaLink,
  idx,
  rowMeta,
  rowName,
  row,
  section,
  statL,
  statN,
  stats,
  title,
  tldr,
} from "../ui";

/* One URL segment, two kinds of document behind it. The slug resolves here and
   `kind` decides which overview it gets. */
export default function SetOverview() {
  const { set: slug } = useParams();
  const set = getSet(slug);
  if (!set) return <Navigate to="/" replace />;
  if (isGrammar(set)) return <GuideOverview guide={set} />;

  return (
    <>
      <h1 className={cn("mt-12", title)}>{set.title}</h1>

      <DocMeta doc={set} />

      <div className={stats}>
        <div>
          <div className={statN}>{set.words.length}</div>
          <div className={statL}>Words</div>
        </div>
        <div>
          <div className={statN}>{examplesIn(set)}</div>
          <div className={statL}>Worked examples</div>
        </div>
        <div>
          <div className={statN}>{synonymsIn(set)}</div>
          <div className={statL}>Synonyms</div>
        </div>
        <div>
          <div className={statN}>{questionsIn(set)}</div>
          <div className={statL}>Quiz questions</div>
        </div>
      </div>

      <div className={block}>
        <h2 className={section}>TL;DR</h2>
        <p className={tldr}>
          <Prose text={set.tldr} />
        </p>
      </div>

      <div className={block}>
        <h2 className={section}>The words</h2>
        <div className="mt-2 border-t border-border">
          {set.words.map((w) => (
            <Link
              className={cn(row, "border-b border-border")}
              key={w.slug}
              to={`/${set.slug}/words?w=${w.slug}`}
            >
              <span className={idx}>{w.n}</span>
              <span className={cn(rowName, "text-[15px] font-semibold")}>{w.term}</span>
              <span className="flex-1" />
              <span className={cn(rowMeta, "tabular-nums")}>
                {w.pos} · {w.examples.length} examples
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className={block}>
        <h2 className={section}>Definitions</h2>
        {set.words.map((w, i) => (
          <Link
            className={cn("block border-b border-border py-4", i === 0 && "border-t")}
            key={w.slug}
            to={`/${set.slug}/words?w=${w.slug}`}
          >
            <div className="flex items-center gap-2">
              <span className={idx}>{w.n}</span>
              <span className="font-medium text-foreground">{w.term}</span>
              <span className="flex-1" />
              <span className="whitespace-nowrap text-[13px] text-muted-foreground">{w.pos}</span>
            </div>
            <p className="mt-1.5 pl-6 text-[15px] leading-relaxed text-muted-foreground text-pretty">
              {w.definition}
            </p>
          </Link>
        ))}
      </div>

      <p className="mt-9">
        <Link className={ctaLink} to={`/${set.slug}/words`}>
          Read all {set.words.length} in full <span className={ctaArrow}>→</span>
        </Link>
      </p>
      <p className="mt-2.5">
        <Link className={ctaLink} to={`/${set.slug}/quiz`}>
          Take the quiz — {scoredIn(set)} scored answers <span className={ctaArrow}>→</span>
        </Link>
      </p>

      {/* No word prop: a set-level comment is stored with a null word_slug, so it
          shows here and in the set's listing but under no individual word. */}
      <CommentThread set={set.slug} />
    </>
  );
}
