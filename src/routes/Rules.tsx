import { Link, Navigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import CommentThread from "../components/CommentThread";
import { ExampleList } from "../components/Verdict";
import { getSet, isGrammar, rulesIn, type Callout, type Chapter, type Pairs } from "../sets";
import { controlLink, controls, ctaArrow, ctaLink, idx, metaName, mono, note, title } from "../ui";

/* Chapters are numbered because the guide genuinely is a sequence — the basic
   rule, then what bends it, then what breaks it. The rules inside a chapter are
   not, so they carry titles alone rather than a second tier of numerals. */

const heading = "text-[19px] font-semibold leading-[1.25] tracking-[-0.005em] text-foreground text-balance";
const ruleTitle = "text-[15px] font-semibold leading-[1.35] text-foreground text-balance";
const gloss = "mt-1.5 text-[15px] leading-relaxed text-muted-foreground text-pretty";

/* Same radius and padding as a library card, so the boxed asides read as part of
   the same family rather than a second card language. */
const calloutBox = "mt-8 rounded-lg border border-border p-[18px] max-sm:p-4";
const calloutTitle =
  "text-[13px] font-semibold uppercase tracking-[0.06em] text-muted-foreground";

export default function Rules() {
  const { set: slug } = useParams();
  const doc = getSet(slug);
  if (!doc || !isGrammar(doc)) return <Navigate to="/" replace />;

  return (
    <>
      <h1 className={cn("mt-12", title)}>The rules, in full</h1>

      <div className={controls}>
        <Link className={controlLink} to={`/${doc.slug}`}>
          {doc.title}
        </Link>
        <span className="text-border">·</span>
        <Link className={controlLink} to={`/${doc.slug}/practice`}>
          Practice
        </Link>
      </div>

      {doc.chapters.map((c) => (
        <ChapterBlock chapter={c} key={c.slug} />
      ))}

      <p className="mt-12">
        <Link className={ctaLink} to={`/${doc.slug}/practice`}>
          Practice all {rulesIn(doc)} rules <span className={ctaArrow}>→</span>
        </Link>
      </p>

      <CommentThread set={doc.slug} />

      <p className={note}>
        Every rule, example sentence, correct/incorrect verdict and boxed aside is taken from{" "}
        <span className={mono}>{doc.file}</span>. The one-line summary under each chapter heading is
        written for this site.
      </p>
    </>
  );
}

function ChapterBlock({ chapter: c }: { chapter: Chapter }) {
  return (
    <section className="mt-16 scroll-mt-8 first:mt-10" id={c.slug} aria-labelledby={`${c.slug}-h`}>
      <div className="flex items-baseline gap-2">
        <span className={idx}>{c.n}</span>
        <h2 className={heading} id={`${c.slug}-h`}>
          {c.title}
        </h2>
      </div>
      <p className="mt-2 pl-6 leading-relaxed text-muted-foreground text-pretty">{c.blurb}</p>

      <div className="mt-7 border-t border-border">
        {c.rules.map((r) => (
          <div className="border-b border-border py-5" key={r.slug}>
            <h3 className={ruleTitle}>{r.title}</h3>
            {r.gloss && <p className={gloss}>{r.gloss}</p>}

            {r.list && (
              <ul className="m-0 mt-2.5 flex list-none flex-wrap gap-x-[18px] gap-y-1.5 p-0 text-sm text-muted-foreground">
                {r.list.map((item) => (
                  <li className="whitespace-nowrap" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            )}

            <ExampleList className="mt-3" examples={r.examples} />

            {/* Aligned to the sentences, not the marks — it is a note on the
                example above it, not a third verdict. */}
            {r.aside && (
              <p className="mt-1.5 pl-[30px] text-[13px] text-muted-foreground">{r.aside}</p>
            )}
          </div>
        ))}
      </div>

      {c.pairs && <PairsTable pairs={c.pairs} />}
      {c.callout && <CalloutBox callout={c.callout} />}
    </section>
  );
}

/* The site's signature element, used for what it is for: a hairline leader that
   fills the gap between a label and its value and fades in on row hover. */
function PairsTable({ pairs }: { pairs: Pairs }) {
  return (
    <div className="mt-8">
      {pairs.caption && (
        <p className="text-[15px] leading-relaxed text-muted-foreground text-pretty">
          {pairs.caption}
        </p>
      )}
      <div className="mt-3.5 border-t border-border">
        <div className="flex items-center gap-2.5 border-b border-border py-2">
          <span className={metaName}>{pairs.head[0]}</span>
          <span className="flex-1" />
          <span className={metaName}>{pairs.head[1]}</span>
        </div>
        {pairs.rows.map(([subject, verb]) => (
          <div
            className="group flex items-center gap-2.5 border-b border-border py-2.5"
            key={subject}
          >
            <span className="whitespace-nowrap font-medium text-foreground">{subject}</span>
            <span className="leader group-hover:opacity-100" />
            <span className="whitespace-nowrap text-muted-foreground">{verb}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalloutBox({ callout: c }: { callout: Callout }) {
  return (
    <div className={calloutBox}>
      <h3 className={calloutTitle}>{c.title}</h3>
      {c.lede && (
        <p className="mt-2.5 text-[15px] leading-relaxed text-foreground text-pretty">{c.lede}</p>
      )}

      {c.steps && (
        <ol className="m-0 mt-3 list-none p-0">
          {c.steps.map((s, i) => (
            <li className="flex items-baseline gap-2 py-[5px] text-[15px] leading-relaxed" key={s}>
              <span className={idx}>{i + 1}</span>
              <span className="text-pretty">{s}</span>
            </li>
          ))}
        </ol>
      )}

      {c.worked && (
        <div className="mt-4 border-t border-border">
          {c.worked.map((w) => (
            <div className="border-b border-border py-3 last:border-b-0 last:pb-0" key={w.sentence}>
              <p className="text-[15px] leading-relaxed text-foreground text-pretty">{w.sentence}</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{w.reading}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
