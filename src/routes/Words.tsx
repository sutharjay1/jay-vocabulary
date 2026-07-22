import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { getSet, type VocabSet } from "../sets";
import { block, controlLink, controls, ctaArrow, ctaLink, eyebrow, idx, lede, section, title, tldr } from "../ui";

/* One-shot enter, staggered 45ms per item. Keyframes are right for a
   predetermined page-load sequence; reduced motion drops the movement. */
const riseIn =
  "translate-y-2 opacity-0 animate-rise motion-reduce:translate-y-0 motion-reduce:animate-fade";
const delays = ["", "[animation-delay:45ms]", "[animation-delay:90ms]", "[animation-delay:135ms]", "[animation-delay:180ms]"];

const spine =
  "relative before:absolute before:left-1 before:top-[9px] before:bottom-[9px] before:w-px before:bg-border before:content-['']";
const dot =
  "absolute left-0 top-1.5 h-[9px] w-[9px] rounded-full bg-foreground shadow-[0_0_0_4px_var(--color-background)]";
const syns = "flex flex-wrap gap-x-[18px] gap-y-1.5 text-sm text-muted-foreground [&>span]:whitespace-nowrap";

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
      <p className={eyebrow}>
        {set.title} · word {word.n} of {set.words.length} · {word.pos}
      </p>
      <h1 className={title}>{word.term}</h1>
      <p className={lede}>{word.definition}</p>

      <div className={controls}>
        {prev ? (
          <Link className={controlLink} to={`/${set.slug}/words?w=${prev.slug}`}>
            ← {prev.term}
          </Link>
        ) : (
          <Link className={controlLink} to={`/${set.slug}`}>
            ← {set.title}
          </Link>
        )}
        <span className="text-border">·</span>
        <Link className={controlLink} to={`/${set.slug}/words`}>
          All {set.words.length}
        </Link>
        <span className="text-border">·</span>
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

      <div>
        <h2 className={section}>Synonyms</h2>
        <div className={`mt-2.5 ${syns}`}>
          {word.synonyms.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>

      <div className={block}>
        <h2 className={section}>In a sentence</h2>
        <div className={`mt-[18px] ${spine}`}>
          {word.examples.map((ex, n) => (
            <div className={`relative pb-6 pl-[30px] last:pb-0 ${riseIn} ${delays[n] ?? ""}`} key={ex}>
              <span className={dot} />
              <div className="mb-1.5 flex items-baseline gap-[9px]">
                <span className="text-sm font-semibold text-foreground">Example {n + 1}</span>
              </div>
              <p className="m-0 text-[15px] leading-relaxed text-foreground text-pretty">{ex}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={block}>
        <h2 className={section}>Note</h2>
        <p className={`${tldr} mt-3`}>{word.note}</p>
      </div>

      <p className="mt-9">
        {next ? (
          <Link className={ctaLink} to={`/${set.slug}/words?w=${next.slug}`}>
            Next — {next.term} <span className={ctaArrow}>→</span>
          </Link>
        ) : (
          <Link className={ctaLink} to={`/${set.slug}/quiz`}>
            Take the quiz <span className={ctaArrow}>→</span>
          </Link>
        )}
      </p>
    </>
  );
}

function AllWords({ set }: { set: VocabSet }) {
  return (
    <>
      <p className={eyebrow}>{set.title} · the full set</p>
      <h1 className={title}>All {set.words.length}, in full</h1>
      <p className={lede}>
        Every definition, synonym set and example sentence in one place. Open a single word for its
        usage note.
      </p>

      <div className={controls}>
        <span className="font-semibold text-foreground">{set.words.length} words</span>
        <span className="text-border">·</span>
        <Link className={controlLink} to={`/${set.slug}`}>
          {set.title}
        </Link>
        <span className="text-border">·</span>
        <Link className={controlLink} to={`/${set.slug}/quiz`}>
          Quiz
        </Link>
      </div>

      <div className={spine}>
        {set.words.map((w, n) => (
          <div className={`relative pb-6 pl-[30px] last:pb-0 ${riseIn} ${delays[n] ?? ""}`} key={w.slug}>
            <span className={dot} />
            <div className="mb-1.5 flex items-baseline gap-[9px]">
              <span className={`${idx} w-auto`}>{w.n}</span>
              <Link
                className="text-sm font-semibold text-foreground"
                to={`/${set.slug}/words?w=${w.slug}`}
              >
                {w.term}
              </Link>
              <span className="text-[12.5px] text-muted-foreground">{w.pos}</span>
            </div>
            <p className="mb-2 text-[15px] leading-relaxed text-muted-foreground text-pretty">
              {w.definition}
            </p>
            <div className={`mb-2.5 ${syns}`}>
              {w.synonyms.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            {w.examples.map((ex) => (
              <div
                className="group/ex flex items-center gap-2 border-b border-border py-2 last:border-b-0 max-sm:flex-wrap"
                key={ex}
              >
                <span className="text-[15px] font-medium text-foreground">{ex}</span>
                <span className="leader group-hover/ex:opacity-100 max-sm:hidden" />
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="mt-9">
        <Link className={ctaLink} to={`/${set.slug}/quiz`}>
          Take the quiz <span className={ctaArrow}>→</span>
        </Link>
      </p>
    </>
  );
}
