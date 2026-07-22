import { Link } from "react-router-dom";
import { SETS, examplesIn, questionsIn } from "../sets";
import { IconArrow } from "../components/icons";

export default function Library() {
  return (
    <>
      <h1 className="pagehead">Vocabulary library</h1>

      <div className="cards">
        {SETS.map((s) => (
          <Link className="card" key={s.slug} to={`/${s.slug}`}>
            <div className="cardrow">
              <span className="cardtitle">{s.title}</span>
              <IconArrow className="arw" />
            </div>
            <span className="cardfile mono">{s.file}</span>
            <span className="cardstats">
              {s.words.length} words · {examplesIn(s)} examples · {questionsIn(s)} questions
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
