import { Link, Navigate, useParams } from "react-router-dom";
import { getSet, examplesIn, synonymsIn, questionsIn, scoredIn } from "../sets";
import Prose from "../components/Prose";

export default function SetOverview() {
  const { set: slug } = useParams();
  const set = getSet(slug);
  if (!set) return <Navigate to="/" replace />;

  return (
    <>
      <p className="eyebrow">
        Set {set.n} · {set.theme}
      </p>
      <h1>{set.title}</h1>
      <p className="lede">{set.lede}</p>

      <div className="meta-list group">
        <div className="row">
          <span className="name">Reference file</span>
          <span className="line" />
          <span className="val mono">{set.file}</span>
        </div>
        <div className="row">
          <span className="name">Contents</span>
          <span className="line" />
          <span className="val">
            {set.words.length} words · {questionsIn(set)} quiz questions
          </span>
        </div>
        <div className="row">
          <span className="name">Theme</span>
          <span className="line" />
          <span className="val">{set.theme}</span>
        </div>
        <div className="row">
          <span className="name">Added</span>
          <span className="line" />
          <span className="val">{set.addedLabel}</span>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="n">{set.words.length}</div>
          <div className="l">Words</div>
        </div>
        <div className="stat">
          <div className="n">{examplesIn(set)}</div>
          <div className="l">Worked examples</div>
        </div>
        <div className="stat">
          <div className="n">{synonymsIn(set)}</div>
          <div className="l">Synonyms</div>
        </div>
        <div className="stat">
          <div className="n">{questionsIn(set)}</div>
          <div className="l">Quiz questions</div>
        </div>
      </div>

      <div className="block">
        <h2 className="section">TL;DR</h2>
        <p className="tldr">
          <Prose text={set.tldr} />
        </p>
      </div>

      <div className="block group">
        <h2 className="section">The words</h2>
        <div className="periods">
          {set.words.map((w) => (
            <Link className="row" key={w.slug} to={`/${set.slug}/words?w=${w.slug}`}>
              <span className="idx">{w.n}</span>
              <span className="name">{w.term}</span>
              <span className="line" />
              <span className="meta">
                {w.pos} · {w.examples.length} examples
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="block">
        <h2 className="section">Definitions</h2>
        {set.words.map((w) => (
          <Link className="feat" key={w.slug} to={`/${set.slug}/words?w=${w.slug}`}>
            <div className="head">
              <span className="idx">{w.n}</span>
              <span className="title">{w.term}</span>
              <span className="ln" />
              <span className="pr">{w.pos}</span>
            </div>
            <p>{w.definition}</p>
          </Link>
        ))}
      </div>

      <p className="cta">
        <Link to={`/${set.slug}/words`}>
          Read all {set.words.length} in full <span className="arw">→</span>
        </Link>
      </p>
      <p className="cta" style={{ marginTop: 10 }}>
        <Link to={`/${set.slug}/quiz`}>
          Take the quiz — {scoredIn(set)} scored answers <span className="arw">→</span>
        </Link>
      </p>

      <p className="note">
        Definitions, synonyms, example sentences and every quiz item are transcribed from{" "}
        <span className="mono">{set.file}</span> without alteration. Parts of speech and the short
        usage notes on each word page are the only additions.
      </p>
    </>
  );
}
