import { Link, Navigate, useParams } from "react-router-dom";
import { getSet, examplesIn, synonymsIn, questionsIn, scoredIn } from "../sets";
import Prose from "../components/Prose";
import {
  block,
  ctaArrow,
  ctaLink,
  eyebrow,
  idx,
  lede,
  metaList,
  metaName,
  metaRow,
  metaVal,
  mono,
  note,
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

export default function SetOverview() {
  const { set: slug } = useParams();
  const set = getSet(slug);
  if (!set) return <Navigate to="/" replace />;

  return (
    <>
      <p className={eyebrow}>
        Set {set.n} · {set.theme}
      </p>
      <h1 className={title}>{set.title}</h1>
      <p className={lede}>{set.lede}</p>

      <div className={metaList}>
        <div className={metaRow}>
          <span className={metaName}>Reference file</span>
          <span className="leader group-hover:opacity-100" />
          <span className={`${metaVal} ${mono}`}>{set.file}</span>
        </div>
        <div className={metaRow}>
          <span className={metaName}>Contents</span>
          <span className="leader group-hover:opacity-100" />
          <span className={metaVal}>
            {set.words.length} words · {questionsIn(set)} quiz questions
          </span>
        </div>
        <div className={metaRow}>
          <span className={metaName}>Theme</span>
          <span className="leader group-hover:opacity-100" />
          <span className={metaVal}>{set.theme}</span>
        </div>
        <div className={metaRow}>
          <span className={metaName}>Added</span>
          <span className="leader group-hover:opacity-100" />
          <span className={metaVal}>{set.addedLabel}</span>
        </div>
      </div>

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

      <div className={`${block} group`}>
        <h2 className={section}>The words</h2>
        <div className="mt-2 border-t border-border">
          {set.words.map((w) => (
            <Link
              className={`${row} border-b border-border`}
              key={w.slug}
              to={`/${set.slug}/words?w=${w.slug}`}
            >
              <span className={idx}>{w.n}</span>
              <span className={`${rowName} text-[15px] font-semibold`}>{w.term}</span>
              <span className="leader group-hover:opacity-100" />
              <span className={`${rowMeta} tabular-nums`}>
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
            className={`group/def block border-b border-border py-4 ${i === 0 ? "border-t" : ""}`}
            key={w.slug}
            to={`/${set.slug}/words?w=${w.slug}`}
          >
            <div className="flex items-center gap-2">
              <span className={idx}>{w.n}</span>
              <span className="font-medium text-foreground">{w.term}</span>
              <span className="leader group-hover/def:opacity-100" />
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

      <p className={note}>
        Definitions, synonyms, example sentences and every quiz item are transcribed from{" "}
        <span className={mono}>{set.file}</span> without alteration. Parts of speech and the short
        usage notes on each word page are the only additions.
      </p>
    </>
  );
}
