import { cn } from "@/lib/utils";
import type { Example } from "../sets";
import { IconCheck, IconCross } from "./icons";

/* The guide teaches almost entirely by contrast, and the site has no colour to
   spend on it. So the verdict borrows the logic the quiz already uses for a
   chosen option: solid foreground when it is the one to take, hairline outline
   when it is not. Weight and fill carry the difference; the label carries it
   for anyone who cannot see either. */

const mark = "grid h-5 w-5 flex-none place-items-center rounded-md border";

export function VerdictMark({ verdict }: { verdict: Example["verdict"] }) {
  const ok = verdict === "correct";
  const Glyph = ok ? IconCheck : IconCross;
  return (
    <span
      className={cn(
        mark,
        ok ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"
      )}
    >
      <Glyph className="block h-3 w-3" />
      <span className="sr-only">{ok ? "Correct" : "Incorrect"}</span>
    </span>
  );
}

/** The examples under a rule, marked and stacked so the verdicts line up in one
    column and the contrast is legible before a single sentence is read. */
export function ExampleList({
  examples,
  className,
}: {
  examples: Example[];
  className?: string;
}) {
  return (
    <ul className={cn("m-0 list-none p-0", className)}>
      {examples.map((ex) => (
        <li className="flex items-start gap-2.5 py-[5px]" key={ex.text}>
          <span className="mt-0.5">
            <VerdictMark verdict={ex.verdict} />
          </span>
          <span
            className={cn(
              "text-[15px] leading-relaxed text-pretty",
              ex.verdict === "correct" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {ex.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
