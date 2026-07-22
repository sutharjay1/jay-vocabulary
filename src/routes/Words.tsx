import { Link, useSearchParams } from "react-router-dom";
import { WORDS } from "../data";

export default function Words() {
  const [params] = useSearchParams();
  const slug = params.get("w");
  const i = WORDS.findIndex((w) => w.slug === slug);
  const word = i >= 0 ? WORDS[i] : null;

  if (!word) return <AllWords />;

  const prev = WORDS[i - 1];
  const next = WORDS[i + 1];

  return (
    <>
      <p className="eyebrow">
        Word {word.n} of {WORDS.length} · {word.pos}
      </p>
      <h1>{word.term}</h1>
      <p className="lede">{word.definition}</p>

      <div className="tl-controls">
        {prev ? (
          <Link to={`/words?w=${prev.slug}`}>← {prev.term}</Link>
        ) : (
          <Link to="/">← Overview</Link>
        )}
        <span className="sep">·</span>
        <Link to="/words">All five</Link>
        <span className="sep">·</span>
        {next ? (
          <Link to={`/words?w=${next.slug}`}>{next.term} →</Link>
        ) : (
          <Link to="/quiz">Quiz →</Link>
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
          <Link to={`/words?w=${next.slug}`}>
            Next — {next.term} <span className="arw">→</span>
          </Link>
        ) : (
          <Link to="/quiz">
            Take the quiz <span className="arw">→</span>
          </Link>
        )}
      </p>
    </>
  );
}

function AllWords() {
  return (
    <>
      <p className="eyebrow">The full set</p>
      <h1>All five, in full</h1>
      <p className="lede">
        Every definition, synonym set and example sentence in one place. Open a single word for its
        usage note.
      </p>

      <div className="tl-controls">
        <span className="rng">{WORDS.length} words</span>
        <span className="sep">·</span>
        <Link to="/">Overview</Link>
        <span className="sep">·</span>
        <Link to="/quiz">Quiz</Link>
      </div>

      <div className="timeline">
        {WORDS.map((w) => (
          <div className="daygroup" key={w.slug}>
            <span className="dot" />
            <div className="dayhead">
              <Link className="daylabel" to={`/words?w=${w.slug}`}>
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
        <Link to="/quiz">
          Take the quiz <span className="arw">→</span>
        </Link>
      </p>
    </>
  );
}
