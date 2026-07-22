import { Link } from "react-router-dom";
import { SETS, examplesIn, questionsIn } from "../sets";
import { IconArrow, IconDoc } from "../components/icons";

const total = {
  words: SETS.reduce((a, s) => a + s.words.length, 0),
  examples: SETS.reduce((a, s) => a + examplesIn(s), 0),
};

export default function Library() {
  return (
    <>
      <p className="eyebrow">Vocabulary</p>
      <h1>Every set, newest first</h1>
      <p className="lede">
        One set per document. Open a set for its words, definitions, examples and quiz — each set
        keeps its own page.
      </p>

      <div className="cards">
        {SETS.map((s) => (
          <Link className="card" key={s.slug} to={`/${s.slug}`}>
            <div className="cardhead">
              <span className="cardn">Set {s.n}</span>
              <span className="cardline" />
              <span className="cardadded">{s.addedLabel}</span>
            </div>

            <h2 className="cardtitle">{s.title}</h2>

            <p className="cardfile">
              <IconDoc className="fileico" />
              <span className="mono">{s.file}</span>
            </p>

            <p className="cardlede">{s.lede}</p>

            <div className="cardfoot">
              <span className="cardstats">
                {s.words.length} words · {examplesIn(s)} examples · {questionsIn(s)} questions
              </span>
              <span className="cardgo">
                Open <IconArrow className="arw" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* With a single set these totals just restate its card. They earn their
          place once there are several. */}
      {SETS.length > 1 && (
        <div className="meta-list group" style={{ marginTop: 44 }}>
          <div className="row">
            <span className="name">Sets</span>
            <span className="line" />
            <span className="val">{SETS.length}</span>
          </div>
          <div className="row">
            <span className="name">Words in total</span>
            <span className="line" />
            <span className="val">{total.words}</span>
          </div>
          <div className="row">
            <span className="name">Example sentences</span>
            <span className="line" />
            <span className="val">{total.examples}</span>
          </div>
        </div>
      )}

      <p className="note">
        Every definition, synonym, example sentence and quiz item is transcribed from the source
        document named on each card. Parts of speech, the usage notes and the open-question model
        answers are the only additions. New sets are added as their documents arrive.
      </p>
    </>
  );
}
