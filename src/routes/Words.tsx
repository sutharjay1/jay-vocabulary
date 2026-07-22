import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import CommentThread from "../components/CommentThread";
import { getSet, type VocabSet } from "../sets";
import { block, controlLink, controls, ctaArrow, ctaLink, idx, lede, section, title } from "../ui";

const syns =
  "flex flex-wrap gap-x-[18px] gap-y-1.5 text-sm text-muted-foreground [&>span]:whitespace-nowrap";

export default function Words() {
  const { set: slug } = useParams();
  const set = getSet(slug);
  const [params] = useSearchParams();

  if (!set) return <Navigate to="/" replace />;

  const i = set.words.findIndex((w) => w.slug === params.get("w"));
  if (i < 0) return <AllWords set={set} />;

  const word = set.words[i];
  const prev = set.words[i - 1];
  const next = set.words[i + 1];

  return (
    <>
      <h1 className={cn("mt-12 mb-1", title)}>{word.term}</h1>
      <p className="mb-4 text-[13px] text-muted-foreground">{word.pos}</p>
      <p className={lede}>{word.definition}</p>

      <div className={block}>
        <h2 className={section}>Synonyms</h2>
        <div className={cn("mt-2.5", syns)}>
          {word.synonyms.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>

      <div className={block}>
        <h2 className={section}>Examples</h2>
        <div className="mt-2 border-t border-border">
          {word.examples.map((ex) => (
            <p
              className="border-b border-border py-3 text-[15px] leading-relaxed text-foreground text-pretty"
              key={ex}
            >
              {ex}
            </p>
          ))}
        </div>
      </div>

      <div className={block}>
        <h2 className={section}>Note</h2>
        <p className="mt-2.5 leading-[1.7] text-muted-foreground text-pretty">{word.note}</p>
      </div>

      <CommentThread set={set.slug} word={word.slug} />

      <div className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-5 text-[15px]">
        {prev ? (
          <Link className={controlLink} to={`/${set.slug}/words?w=${prev.slug}`}>
            ← {prev.term}
          </Link>
        ) : (
          <Link className={controlLink} to={`/${set.slug}`}>
            ← {set.title}
          </Link>
        )}
        {next ? (
          <Link className={controlLink} to={`/${set.slug}/words?w=${next.slug}`}>
            {next.term} →
          </Link>
        ) : (
          <Link className={controlLink} to={`/${set.slug}/quiz`}>
            Quiz →
          </Link>
        )}
      </div>
    </>
  );
}

function AllWords({ set }: { set: VocabSet }) {
  return (
    <>
      <h1 className={cn("mt-12", title)}>All {set.words.length}, in full</h1>

      <div className={controls}>
        <Link className={controlLink} to={`/${set.slug}`}>
          {set.title}
        </Link>
        <span className="text-border">·</span>
        <Link className={controlLink} to={`/${set.slug}/quiz`}>
          Quiz
        </Link>
      </div>

      {set.words.map((w) => (
        <div className="mt-10 border-t border-border pt-5 first:mt-0" key={w.slug}>
          <div className="flex items-baseline gap-2.5">
            <span className={cn(idx, "w-auto")}>{w.n}</span>
            <Link
              className="text-[17px] font-semibold text-foreground"
              to={`/${set.slug}/words?w=${w.slug}`}
            >
              {w.term}
            </Link>
            <span className="text-[13px] text-muted-foreground">{w.pos}</span>
          </div>

          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground text-pretty">
            {w.definition}
          </p>

          <div className={cn("mt-2.5", syns)}>
            {w.synonyms.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>

          <div className="mt-4">
            {w.examples.map((ex) => (
              <p
                className="border-b border-border py-2.5 text-[15px] leading-relaxed text-foreground text-pretty last:border-b-0"
                key={ex}
              >
                {ex}
              </p>
            ))}
          </div>
        </div>
      ))}

      <p className="mt-10">
        <Link className={ctaLink} to={`/${set.slug}/quiz`}>
          Take the quiz <span className={ctaArrow}>→</span>
        </Link>
      </p>
    </>
  );
}
