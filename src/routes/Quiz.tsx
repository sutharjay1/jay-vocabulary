import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getSet, scoredIn } from "../sets";
import { block, controlLink, controls, ctaArrow, ctaLink, mono, note, section, title } from "../ui";

const KEYS = ["A", "B", "C", "D"];

/* The verdict fades down into place once answers are checked. */
const verdictState = (checked: boolean) =>
  checked ? "mt-2.5 translate-y-0 opacity-100" : "-translate-y-[3px] opacity-0";

const q = "border-b border-border py-[26px] first:border-t";
const qnum = "min-w-[18px] text-[13px] tabular-nums text-muted-foreground";
const qprompt = "font-medium text-foreground text-pretty";

/* Choosing an option settles it into the state hovering previews: the same
   rounded tinted row, held. The letter box fills solid so the choice still
   reads once the pointer moves away — hover alone can't carry that. */
const opt = cn(
  "group/opt -mx-2.5 flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left",
  "text-muted-foreground transition-colors duration-150",
  "hover:bg-foreground/[0.035] hover:text-foreground active:bg-foreground/[0.06]",
  "aria-checked:bg-foreground/[0.055] aria-checked:text-foreground",
  "disabled:cursor-default disabled:hover:bg-transparent",
  "disabled:aria-checked:bg-foreground/[0.055] disabled:aria-checked:text-foreground"
);
const optKey = cn(
  "grid h-[22px] w-[22px] flex-none place-items-center rounded-md border border-border",
  "text-[11px] font-semibold leading-none text-muted-foreground transition-colors duration-150",
  "group-hover/opt:border-border-strong",
  "group-aria-checked/opt:border-foreground group-aria-checked/opt:bg-foreground group-aria-checked/opt:text-background"
);

const verdict =
  "ml-7 text-[13px] text-muted-foreground text-pretty transition-[opacity,transform] duration-200 ease-out-quint [&_b]:font-semibold [&_b]:text-foreground motion-reduce:transform-none max-sm:ml-0";
const btn =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-foreground bg-foreground px-[18px] text-[15px] font-semibold text-background transition-[transform,opacity] duration-150 ease-out-quint hover:opacity-[0.86] active:scale-[0.97] disabled:cursor-default disabled:opacity-35 disabled:hover:opacity-35 disabled:active:scale-100 motion-reduce:active:scale-100";

export default function Quiz() {
  const { set: slug } = useParams();
  const set = getSet(slug);

  const [choice, setChoice] = useState<Record<number, number>>({});
  const [blank, setBlank] = useState<Record<number, string>>({});
  const [match, setMatch] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [checked, setChecked] = useState(false);

  if (!set) return <Navigate to="/" replace />;

  const { partA, partB, partC, partD, bank, meanings } = set.quiz;
  const scored = scoredIn(set);

  const answered =
    Object.keys(choice).length + Object.keys(blank).length + Object.keys(match).length;

  const score =
    partA.filter((x) => choice[x.n] === x.answer).length +
    partB.filter((x) => blank[x.n] === x.answer).length +
    partC.filter((x) => match[x.n] === x.answer).length;

  function reset() {
    setChoice({});
    setBlank({});
    setMatch({});
    setChecked(false);
  }

  return (
    <>
      <h1 className={cn("mt-12", title)}>Quiz</h1>

      <div className={controls}>
        <Link className={controlLink} to={`/${set.slug}/words`}>
          All {set.words.length} words
        </Link>
        <span className="text-border">·</span>
        <Link className={controlLink} to={`/${set.slug}`}>
          {set.title}
        </Link>
      </div>

      {/* ---------- Part A ---------- */}
      <div>
        <h2 className={section}>Part A · Multiple choice</h2>
        {partA.map((x) => {
          const picked = choice[x.n];
          return (
            <div className={q} key={x.n}>
              <div className="flex items-baseline gap-2.5">
                <span className={qnum}>{x.n}.</span>
                <span className={qprompt}>{x.prompt}</span>
              </div>
              <div className="ml-7 mt-2 flex flex-col max-sm:ml-0" role="radiogroup">
                {x.options.map((o, oi) => (
                  <button
                    key={o}
                    type="button"
                    className={opt}
                    role="radio"
                    aria-checked={picked === oi}
                    disabled={checked}
                    onClick={() => setChoice((s) => ({ ...s, [x.n]: oi }))}
                  >
                    <span className={optKey} aria-hidden="true">
                      {KEYS[oi]}
                    </span>
                    <span className="flex-1 text-pretty">{o}</span>
                  </button>
                ))}
              </div>
              <div
                className={cn(verdict, verdictState(checked))}
                role="status"
              >
                {checked &&
                  (picked === x.answer ? (
                    <b>Correct.</b>
                  ) : (
                    <>
                      Not quite — the answer is <b>{KEYS[x.answer]}</b>. {x.options[x.answer]}
                    </>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- Part B ---------- */}
      <div className={block}>
        <h2 className={section}>Part B · Fill in the blank</h2>
        <p className="mb-[26px] text-sm text-muted-foreground">
          Choose from: <strong className="font-semibold text-foreground">{bank.join(", ")}</strong>
        </p>
        {partB.map((x) => {
          const val = blank[x.n] ?? "";
          return (
            <div className={q} key={x.n}>
              <div className="flex items-baseline gap-2.5">
                <span className={qnum}>{x.n}.</span>
                <span className="font-medium text-pretty">
                  <span className="text-muted-foreground">{x.before}</span>
                  <select
                    className={cn("slot", val === "" && "slot-empty", checked ? "slot-locked" : "hover:border-foreground")}
                    disabled={checked}
                    value={val}
                    aria-label={`Answer for question ${x.n}`}
                    onChange={(e) => setBlank((s) => ({ ...s, [x.n]: e.target.value }))}
                  >
                    <option value="">__________</option>
                    {bank.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <span className="text-muted-foreground">{x.after}</span>
                </span>
              </div>
              <div
                className={cn(verdict, verdictState(checked))}
                role="status"
              >
                {checked &&
                  (val === x.answer ? (
                    <b>Correct.</b>
                  ) : (
                    <>
                      Not quite — the answer is <b>{x.answer}</b>.
                    </>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- Part C ---------- */}
      <div className={block}>
        <h2 className={section}>Part C · Matching</h2>
        <p className="mb-[26px] text-sm text-muted-foreground">Match each item to its meaning.</p>
        <div className={cn("group", q)}>
          <div>
            {partC.map((x) => {
              const val = match[x.n] ?? "";
              return (
                <div
                  className="flex items-center gap-2.5 border-b border-border py-[11px] last:border-b-0 max-sm:flex-wrap max-sm:gap-x-2.5 max-sm:gap-y-0.5"
                  key={x.n}
                >
                  <span className="whitespace-nowrap text-[15px] font-semibold text-foreground">
                    {x.item}
                  </span>
                  <span className="leader group-hover:opacity-100 max-sm:hidden" />
                  <select
                    className={cn("slot-block", val === "" && "slot-empty", checked ? "slot-locked" : "hover:border-foreground")}
                    disabled={checked}
                    value={val}
                    aria-label={`Meaning for ${x.item}`}
                    onChange={(e) => setMatch((s) => ({ ...s, [x.n]: e.target.value }))}
                  >
                    <option value="">Choose a meaning</option>
                    {meanings.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
          <div
            className={cn(verdict, "ml-0", verdictState(checked))}
            role="status"
          >
            {checked &&
              (partC.every((x) => match[x.n] === x.answer) ? (
                <b>All {partC.length} correct.</b>
              ) : (
                <>
                  {partC.filter((x) => match[x.n] === x.answer).length} of {partC.length} correct —{" "}
                  {partC.map((x, k) => (
                    <span key={x.n}>
                      {k > 0 && "; "}
                      {x.item} is <b>{x.answer.toLowerCase()}</b>
                    </span>
                  ))}
                  .
                </>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-x-[18px] gap-y-3 print:hidden">
        <button
          className={btn}
          type="button"
          disabled={!checked && answered === 0}
          onClick={() => (checked ? reset() : setChecked(true))}
        >
          {checked ? "Try again" : "Check answers"}
        </button>
        <span
          className={cn(
            "text-[15px] text-muted-foreground transition-[opacity,transform] duration-[220ms] ease-out-quint [&_b]:font-semibold [&_b]:tabular-nums [&_b]:text-foreground",
            checked ? "translate-y-0 opacity-100" : "-translate-y-[3px] opacity-0"
          )}
          role="status"
        >
          {checked && (
            <>
              <b>
                {score} of {scored}
              </b>{" "}
              correct
              {answered < scored ? " · some left blank" : ""}
            </>
          )}
        </span>
      </div>

      {/* ---------- Part D ---------- */}
      <div className={block}>
        <h2 className={section}>Part D · Context</h2>
        {partD.map((x) => (
          <div className={q} key={x.n}>
            <div className="flex items-baseline gap-2.5">
              <span className={qnum}>{x.n}.</span>
              <span className={qprompt}>{x.prompt}</span>
            </div>
            {x.lines && (
              <ul className="ml-7 mt-2.5 list-none p-0 max-sm:ml-0">
                {x.lines.map((l) => (
                  <li className="py-[3px]" key={l}>
                    {l}
                  </li>
                ))}
              </ul>
            )}
            <textarea
              className="mt-3 block min-h-[84px] w-full resize-y rounded-[10px] border border-border px-3.5 py-3 text-[15px] text-foreground transition-colors duration-150 placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none"
              placeholder="Write your answer here…"
              aria-label={`Your answer for question ${x.n}`}
            />
            <button
              className="mt-3 text-[13px] font-semibold text-muted-foreground transition-[color,transform] duration-150 ease-out-quint hover:text-foreground active:scale-[0.97] motion-reduce:active:scale-100 print:hidden"
              type="button"
              aria-expanded={!!revealed[x.n]}
              onClick={() => setRevealed((s) => ({ ...s, [x.n]: !s[x.n] }))}
            >
              {revealed[x.n] ? "Hide the model answer" : "Show a model answer"}
            </button>
            {/* Mounts on reveal, so @starting-style drives the enter. No exit
                animation by design — unmount is instant. */}
            {revealed[x.n] && (
              <div className="mt-2.5 translate-y-0 text-[15px] leading-relaxed text-pretty opacity-100 transition-[opacity,transform] duration-[180ms] ease-out-quint starting:-translate-y-1 starting:opacity-0">
                {x.model}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-9">
        <Link className={ctaLink} to={`/${set.slug}/words`}>
          Back to the words <span className={ctaArrow}>→</span>
        </Link>
      </p>

      <p className={note}>
        Every question, option and answer key is taken from{" "}
        <span className={mono}>{set.file}</span>. The model answers in part D are written for this
        site; the document leaves those open.
      </p>
    </>
  );
}
