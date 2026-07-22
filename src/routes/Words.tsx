import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { getSet, type VocabSet } from "../sets";

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
      <p className="eyebrow">
        {set.title} · word {word.n} of {set.words.length} · {word.pos}
      </p>
      <h1>{word.term}</h1>
      <p className="lede">{word.definition}</p>

      <div className="tl-controls">
        {prev ? (
          <Link to={`/${set.slug}/words?w=${prev.slug}`}>← {prev.term}</Link>
        ) : (
          <Link to={`/${set.slug}`}>← {set.title}</Link>
        )}
        <span className="sep">·</span>
        <Link to={`/${set.slug}/words`}>All {set.words.length}</Link>
        <span className="sep">·</span>
        {next ? (
          <Link to={`/${set.slug}/words?w=${next.slug}`}>{next.term} →</Link>
        ) : (
          <Link to={`/${set.slug}/quiz`}>Quiz →</Link>
        )}
      </div>

      <div className="block" style={{ marginTop: 0 }}>
        <h2 className="section">Synonyms</h2>
        <div className="syns">
          {word.synonyms.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>

      <div className="block">
        <h2 className="section">In a sentence</h2>
        <div className="timeline" style={{ marginTop: 18 }}>
          {word.examples.map((ex, n) => (
            <div className="daygroup" key={ex}>
              <span className="dot" />
              <div className="dayhead">
                <span className="daylabel">Example {n + 1}</span>
              </div>
              <p className="daydef" style={{ color: "var(--foreground)" }}>
                {ex}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="block">
        <h2 className="section">Note</h2>
        <p className="tldr" style={{ marginTop: 12 }}>
          {word.note}
        </p>
      </div>

      <p className="cta">
        {next ? (
          <Link to={`/${set.slug}/words?w=${next.slug}`}>
            Next — {next.term} <span className="arw">→</span>
          </Link>
        ) : (
          <Link to={`/${set.slug}/quiz`}>
            Take the quiz <span className="arw">→</span>
          </Link>
        )}
      </p>
    </>
  );
}

function AllWords({ set }: { set: VocabSet }) {
  return (
    <>
      <p className="eyebrow">{set.title} · the full set</p>
      <h1>All {set.words.length}, in full</h1>
      <p className="lede">
        Every definition, synonym set and example sentence in one place. Open a single word for its
        usage note.
      </p>

      <div className="tl-controls">
        <span className="rng">{set.words.length} words</span>
        <span className="sep">·</span>
        <Link to={`/${set.slug}`}>{set.title}</Link>
        <span className="sep">·</span>
        <Link to={`/${set.slug}/quiz`}>Quiz</Link>
      </div>

      <div className="timeline">
        {set.words.map((w) => (
          <div className="daygroup" key={w.slug}>
            <span className="dot" />
            <div className="dayhead">
              <span className="idx">{w.n}</span>
              <Link className="daylabel" to={`/${set.slug}/words?w=${w.slug}`}>
                {w.term}
              </Link>
              <span className="daycount">{w.pos}</span>
            </div>
            <p className="daydef">{w.definition}</p>
            <div className="syns" style={{ marginTop: 0, marginBottom: 10 }}>
              {w.synonyms.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            {w.examples.map((ex) => (
              <div className="tl-commit" key={ex}>
                <span className="msg">{ex}</span>
                <span className="ln" />
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="cta">
        <Link to={`/${set.slug}/quiz`}>
          Take the quiz <span className="arw">→</span>
        </Link>
      </p>
    </>
  );
}
