import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import CommentThread from "../components/CommentThread";
import { VerdictMark } from "../components/Verdict";
import { drillsIn, getSet, isGrammar, type Fix, type Pick } from "../sets";
import { block, controlLink, controls, ctaArrow, ctaLink, mono, note, section, title } from "../ui";

/* Shapes borrowed from the vocabulary quiz so the two feel like one product:
   the same question row, the same verdict that fades down on check, the same
   primary button. */
const q = "border-b border-border py-[26px] first:border-t";
const qnum = "min-w-[18px] text-[13px] tabular-nums text-muted-foreground";
const verdictState = (checked: boolean) =>
  checked ? "mt-2.5 translate-y-0 opacity-100" : "-translate-y-[3px] opacity-0";
const verdict =
  "ml-7 text-[13px] text-muted-foreground text-pretty transition-[opacity,transform] duration-200 ease-out-quint [&_b]:font-semibold [&_b]:text-foreground motion-reduce:transform-none max-sm:ml-0";
const btn =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-foreground bg-foreground px-[18px] text-[15px] font-semibold text-background transition-[transform,opacity] duration-150 ease-out-quint hover:opacity-[0.86] active:scale-[0.96] disabled:cursor-default disabled:opacity-35 disabled:hover:opacity-35 disabled:active:scale-100 motion-reduce:active:scale-100";

/* The document prints its own options inline — "The bird ___ (sing / sings)" —
   so the control is inline too: a two-up segmented pair sitting in the sentence
   where the blank was. Picking one fills it solid, the same way a chosen quiz
   option fills, so the answer still reads once the pointer leaves. */
const optGroup = "inline-flex overflow-hidden rounded-md border border-border";
const opt = cn(
  "min-h-9 px-3 text-[15px] font-semibold leading-none",
  "text-muted-foreground transition-colors duration-150",
  "hover:bg-foreground/[0.05] hover:text-foreground active:bg-foreground/[0.09]",
  "aria-checked:bg-foreground aria-checked:text-background",
  "disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-muted-foreground",
  "disabled:aria-checked:bg-foreground disabled:aria-checked:text-background"
);

const input =
  "mt-3 block w-full rounded-[10px] border border-border px-3.5 py-2.5 text-[15px] text-foreground transition-colors duration-150 placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none disabled:cursor-default";

/* Rewrites are marked on the words, not the typing: case, punctuation and curly
   quotes are all normalised away before comparing. */
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export default function Practice() {
  const { set: slug } = useParams();
  const doc = getSet(slug);

  const [pick, setPick] = useState<Record<number, string>>({});
  const [fix, setFix] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  if (!doc || !isGrammar(doc)) return <Navigate to="/" replace />;

  const { drills, fixes, fixBrief } = doc.practice;
  const total = drillsIn(doc);

  const picks = drills.flatMap((d) => d.picks);
  const answered =
    picks.filter((p) => pick[p.n]).length + fixes.filter((f) => fix[f.n]?.trim()).length;
  const score =
    picks.filter((p) => pick[p.n] === p.answer).length +
    fixes.filter((f) => norm(fix[f.n] ?? "") === norm(f.answer)).length;

  function reset() {
    setPick({});
    setFix({});
    setChecked(false);
  }

  return (
    <>
      <h1 className={cn("mt-12", title)}>Practice</h1>

      <div className={controls}>
        <Link className={controlLink} to={`/${doc.slug}`}>
          {doc.title}
        </Link>
        <span className="text-border">·</span>
        <Link className={controlLink} to={`/${doc.slug}/rules`}>
          The rules
        </Link>
      </div>

      {drills.map((d, i) => (
        <div className={i === 0 ? undefined : block} key={d.slug}>
          <h2 className={section}>{d.title}</h2>
          <p className="mb-[26px] text-sm text-muted-foreground">{d.brief}</p>
          {d.picks.map((p) => (
            <PickRow
              checked={checked}
              key={p.n}
              onPick={(v) => setPick((s) => ({ ...s, [p.n]: v }))}
              pick={p}
              picked={pick[p.n]}
            />
          ))}
        </div>
      ))}

      <div className={block}>
        <h2 className={section}>Correct these sentences</h2>
        <p className="mb-[26px] text-sm text-muted-foreground">{fixBrief}</p>
        {fixes.map((f) => (
          <FixRow
            checked={checked}
            fix={f}
            key={f.n}
            onType={(v) => setFix((s) => ({ ...s, [f.n]: v }))}
            value={fix[f.n] ?? ""}
          />
        ))}
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-x-[18px] gap-y-3 print:hidden">
        <button
          className={btn}
          disabled={!checked && answered === 0}
          onClick={() => (checked ? reset() : setChecked(true))}
          type="button"
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
                {score} of {total}
              </b>{" "}
              correct
              {answered < total ? " · some left blank" : ""}
            </>
          )}
        </span>
      </div>

      <p className="mt-9">
        <Link className={ctaLink} to={`/${doc.slug}/rules`}>
          Back to the rules <span className={ctaArrow}>→</span>
        </Link>
      </p>

      <CommentThread set={doc.slug} />

      <p className={note}>
        Every sentence and both options come from <span className={mono}>{doc.file}</span>, which
        prints the exercises without a key. The answers, and the one line explaining each, are
        written for this site.
      </p>
    </>
  );
}

function PickRow({
  pick,
  picked,
  checked,
  onPick,
}: {
  pick: Pick;
  picked?: string;
  checked: boolean;
  onPick: (v: string) => void;
}) {
  const right = picked === pick.answer;
  return (
    <div className={q}>
      <div className="flex items-baseline gap-2.5">
        <span className={qnum}>{pick.n}.</span>
        <span className="font-medium text-foreground text-pretty">
          {pick.before}
          <span
            aria-label={`Answer for question ${pick.n}`}
            className={optGroup}
            role="radiogroup"
          >
            {pick.options.map((o, i) => (
              <button
                aria-checked={picked === o}
                className={cn(opt, i > 0 && "border-l border-border")}
                disabled={checked}
                key={o}
                onClick={() => onPick(o)}
                role="radio"
                type="button"
              >
                {o}
              </button>
            ))}
          </span>
          {pick.after}
        </span>
      </div>
      <div className={cn(verdict, verdictState(checked))} role="status">
        {checked &&
          (right ? (
            <>
              <b>Correct.</b> {pick.why}
            </>
          ) : (
            <>
              Not quite — the answer is <b>{pick.answer}</b>. {pick.why}
            </>
          ))}
      </div>
    </div>
  );
}

function FixRow({
  fix,
  value,
  checked,
  onType,
}: {
  fix: Fix;
  value: string;
  checked: boolean;
  onType: (v: string) => void;
}) {
  const right = norm(value) === norm(fix.answer);
  return (
    <div className={q}>
      <div className="flex items-baseline gap-2.5">
        <span className={qnum}>{fix.n}.</span>
        <span className="flex items-start gap-2.5">
          <span className="mt-0.5">
            <VerdictMark verdict="incorrect" />
          </span>
          <span className="leading-relaxed text-muted-foreground text-pretty">{fix.wrong}</span>
        </span>
      </div>
      <div className="ml-7 max-sm:ml-0">
        <input
          aria-label={`Your rewrite of sentence ${fix.n}`}
          className={input}
          disabled={checked}
          onChange={(e) => onType(e.target.value)}
          placeholder="Rewrite it so the verb agrees…"
          type="text"
          value={value}
        />
      </div>
      <div className={cn(verdict, verdictState(checked))} role="status">
        {checked &&
          (right ? (
            <>
              <b>Correct.</b> {fix.why}
            </>
          ) : (
            <>
              Not quite — it should read <b>{fix.answer}</b> {fix.why}
            </>
          ))}
      </div>
    </div>
  );
}
