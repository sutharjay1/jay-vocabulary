import { useState } from "react";
import { Link } from "react-router-dom";
import {
  PART_A,
  PART_B,
  PART_C,
  PART_D,
  BLANK_BANK,
  MATCH_MEANINGS,
  TOTAL_SCORED,
  TOTAL_QUESTIONS,
} from "../data";

const KEYS = ["A", "B", "C", "D"];

export default function Quiz() {
  const [choice, setChoice] = useState<Record<number, number>>({});
  const [blank, setBlank] = useState<Record<number, string>>({});
  const [match, setMatch] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [checked, setChecked] = useState(false);

  const answered =
    Object.keys(choice).length + Object.keys(blank).length + Object.keys(match).length;

  const score =
    PART_A.filter((q) => choice[q.n] === q.answer).length +
    PART_B.filter((q) => blank[q.n] === q.answer).length +
    PART_C.filter((q) => match[q.n] === q.answer).length;

  function reset() {
    setChoice({});
    setBlank({});
    setMatch({});
    setChecked(false);
  }

  return (
    <>
      <p className="eyebrow">Check yourself</p>
      <h1>Quiz</h1>
      <p className="lede">
        Seven questions across four parts. Parts A, B and C are scored — {TOTAL_SCORED} answers in
        all. Part D is open: write your own, then compare it against a model answer.
      </p>

      <div className="tl-controls">
        <span className="rng">{TOTAL_QUESTIONS} questions</span>
        <span className="sep">·</span>
        <Link to="/words">All five words</Link>
        <span className="sep">·</span>
        <Link to="/">Overview</Link>
      </div>

      {/* ---------- Part A ---------- */}
      <div className="block" style={{ marginTop: 8 }}>
        <h2 className="section">Part A · Multiple choice</h2>
        {PART_A.map((q) => {
          const picked = choice[q.n];
          const right = picked === q.answer;
          return (
            <div className="q" key={q.n}>
              <div className="qhead">
                <span className="qnum">{q.n}.</span>
                <span className="qprompt">{q.prompt}</span>
              </div>
              <div className={"opts" + (checked ? " locked" : "")} role="radiogroup">
                {q.options.map((opt, oi) => (
                  <button
                    key={opt}
                    type="button"
                    className="opt"
                    role="radio"
                    aria-checked={picked === oi}
                    disabled={checked}
                    onClick={() => setChoice((s) => ({ ...s, [q.n]: oi }))}
                  >
                    <span className="key">{KEYS[oi]}</span>
                    <span className="txt">{opt}</span>
                  </button>
                ))}
              </div>
              <div className={"verdict" + (checked ? " on" : "")} role="status">
                {checked &&
                  (right ? (
                    <b>Correct.</b>
                  ) : (
                    <>
                      Not quite — the answer is <b>{KEYS[q.answer]}</b>. {q.options[q.answer]}
                    </>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- Part B ---------- */}
      <div className="block">
        <h2 className="section">Part B · Fill in the blank</h2>
        <p className="bank">
          Choose from: <strong>{BLANK_BANK.join(", ")}</strong>
        </p>
        {PART_B.map((q) => {
          const val = blank[q.n] ?? "";
          const right = val === q.answer;
          return (
            <div className="q" key={q.n}>
              <div className="qhead">
                <span className="qnum">{q.n}.</span>
                <span className="qprompt" style={{ fontWeight: 500 }}>
                  <span style={{ color: "var(--muted-foreground)" }}>{q.before}</span>
                  <select
                    className="pick inline"
                    data-empty={val === ""}
                    disabled={checked}
                    value={val}
                    aria-label={`Answer for question ${q.n}`}
                    onChange={(e) => setBlank((s) => ({ ...s, [q.n]: e.target.value }))}
                  >
                    <option value="">__________</option>
                    {BLANK_BANK.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <span style={{ color: "var(--muted-foreground)" }}>{q.after}</span>
                </span>
              </div>
              <div className={"verdict" + (checked ? " on" : "")} role="status">
                {checked &&
                  (right ? (
                    <b>Correct.</b>
                  ) : (
                    <>
                      Not quite — the answer is <b>{q.answer}</b>.
                    </>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- Part C ---------- */}
      <div className="block">
        <h2 className="section">Part C · Matching</h2>
        <p className="bank">Match each item to its meaning.</p>
        <div className="q matchgroup">
          <div className="mrows">
            {PART_C.map((q) => {
              const val = match[q.n] ?? "";
              return (
                <div className="mrow" key={q.n}>
                  <span className="name">{q.item}</span>
                  <span className="line" />
                  <select
                    className="pick"
                    data-empty={val === ""}
                    disabled={checked}
                    value={val}
                    aria-label={`Meaning for ${q.item}`}
                    onChange={(e) => setMatch((s) => ({ ...s, [q.n]: e.target.value }))}
                  >
                    <option value="">Choose a meaning</option>
                    {MATCH_MEANINGS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
          <div className={"verdict" + (checked ? " on" : "")} style={{ marginLeft: 0 }} role="status">
            {checked &&
              (PART_C.every((q) => match[q.n] === q.answer) ? (
                <b>All three correct.</b>
              ) : (
                <>
                  {PART_C.filter((q) => match[q.n] === q.answer).length} of {PART_C.length} correct
                  —{" "}
                  {PART_C.map((q, k) => (
                    <span key={q.n}>
                      {k > 0 && "; "}
                      {q.item} is <b>{q.answer.toLowerCase()}</b>
                    </span>
                  ))}
                  .
                </>
              ))}
          </div>
        </div>
      </div>

      <div className="actions">
        <button
          className="btn"
          type="button"
          disabled={!checked && answered === 0}
          onClick={() => (checked ? reset() : setChecked(true))}
        >
          {checked ? "Try again" : "Check answers"}
        </button>
        <span className={"score" + (checked ? " on" : "")} role="status">
          {checked && (
            <>
              <b>
                {score} of {TOTAL_SCORED}
              </b>{" "}
              correct
              {answered < TOTAL_SCORED && checked ? " · some left blank" : ""}
            </>
          )}
        </span>
      </div>

      {/* ---------- Part D ---------- */}
      <div className="block">
        <h2 className="section">Part D · Context</h2>
        {PART_D.map((q) => (
          <div className="q" key={q.n}>
            <div className="qhead">
              <span className="qnum">{q.n}.</span>
              <span className="qprompt">{q.prompt}</span>
            </div>
            {q.lines && (
              <ul style={{ margin: "10px 0 0 28px", padding: 0, listStyle: "none" }}>
                {q.lines.map((l) => (
                  <li key={l} style={{ padding: "3px 0" }}>
                    {l}
                  </li>
                ))}
              </ul>
            )}
            <textarea
              className="answerbox"
              placeholder="Write your answer here…"
              aria-label={`Your answer for question ${q.n}`}
            />
            <button
              className="reveal"
              type="button"
              aria-expanded={!!revealed[q.n]}
              onClick={() => setRevealed((s) => ({ ...s, [q.n]: !s[q.n] }))}
            >
              {revealed[q.n] ? "Hide the model answer" : "Show a model answer"}
            </button>
            {revealed[q.n] && <div className="model">{q.model}</div>}
          </div>
        ))}
      </div>

      <p className="cta">
        <Link to="/words">
          Back to the words <span className="arw">→</span>
        </Link>
      </p>

      <p className="note">
        Every question, option and answer key is taken from{" "}
        <span className="mono">Vocabulary_doc_1.docx</span>. The model answers in part D are written
        for this site; the document leaves those open.
      </p>
    </>
  );
}
