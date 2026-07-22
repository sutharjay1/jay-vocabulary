import { Link } from "react-router-dom";
import { WORDS, TOTAL_QUESTIONS } from "../data";

const examples = WORDS.reduce((a, w) => a + w.examples.length, 0);
const synonyms = WORDS.reduce((a, w) => a + w.synonyms.length, 0);

export default function Overview() {
  return (
    <>
      <p className="eyebrow">Vocabulary study set</p>
      <h1>Five words and how to use them</h1>
      <p className="lede">
        Definitions, synonyms and worked examples for five items of professional English — then a
        quiz that checks whether you can actually place them in a sentence.
      </p>

      <div className="meta-list group">
        <div className="row">
          <span className="name">Set</span>
          <span className="line" />
          <span className="val">Professional English · 1</span>
        </div>
        <div className="row">
          <span className="name">Contents</span>
          <span className="line" />
          <span className="val">5 words · 4 quiz parts</span>
        </div>
        <div className="row">
          <span className="name">Source</span>
          <span className="line" />
          <span className="val mono">Vocabulary_doc_1.docx</span>
        </div>
        <div className="row">
          <span className="name">Prepared</span>
          <span className="line" />
          <span className="val">22 Jul 2026</span>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="n">{WORDS.length}</div>
          <div className="l">Words</div>
        </div>
        <div className="stat">
          <div className="n">{examples}</div>
          <div className="l">Worked examples</div>
        </div>
        <div className="stat">
          <div className="n">{synonyms}</div>
          <div className="l">Synonyms</div>
        </div>
        <div className="stat">
          <div className="n">{TOTAL_QUESTIONS}</div>
          <div className="l">Quiz questions</div>
        </div>
      </div>

      <div className="block">
        <h2 className="section">TL;DR</h2>
        <p className="tldr">
          Five items that do quiet work in professional English. Three are single words —{" "}
          <strong>compelling</strong>, <strong>navigate</strong> and <strong>leverage</strong> — and
          each one carries a physical image underneath the abstract sense: something pulls you,
          something is steered through, something is used as a lever. The other two are phrases.{" "}
          <strong>Read the room</strong> is about noticing a mood <em>and</em> changing what you do
          because of it; noticing alone doesn’t count. <strong>In hindsight</strong> frames a
          judgement you could only reach once you knew the ending. Together they cover the three
          situations most professional writing keeps returning to: making a case, getting through
          something difficult, and looking back at it afterwards.
        </p>
      </div>

      <div className="block group">
        <h2 className="section">The words</h2>
        <div className="periods">
          {WORDS.map((w) => (
            <Link className="row" key={w.slug} to={`/words?w=${w.slug}`}>
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
        {WORDS.map((w) => (
          <Link className="feat" key={w.slug} to={`/words?w=${w.slug}`}>
            <div className="head">
              <span className="title">{w.term}</span>
              <span className="ln" />
              <span className="pr">{w.pos}</span>
            </div>
            <p>{w.definition}</p>
          </Link>
        ))}
      </div>

      <p className="cta">
        <Link to="/words">
          Read all five in full <span className="arw">→</span>
        </Link>
      </p>
      <p className="cta" style={{ marginTop: 10 }}>
        <Link to="/quiz">
          Take the quiz <span className="arw">→</span>
        </Link>
      </p>

      <p className="note">
        Definitions, synonyms, example sentences and every quiz item are transcribed from{" "}
        <span className="mono">Vocabulary_doc_1.docx</span> without alteration. Parts of speech and
        the short usage notes on each word page are the only additions.
      </p>
    </>
  );
}
