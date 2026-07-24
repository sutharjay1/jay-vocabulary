import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import CommentThread from "../components/CommentThread";
import DocMeta from "../components/DocMeta";
import Prose from "../components/Prose";
import { casesIn, drillsIn, rulesIn, type GrammarGuide } from "../sets";
import {
  block,
  ctaArrow,
  ctaLink,
  idx,
  lede,
  row,
  rowMeta,
  rowName,
  section,
  statL,
  statN,
  stats,
  title,
  tldr,
} from "../ui";

export default function GuideOverview({ guide }: { guide: GrammarGuide }) {
  return (
    <>
      <h1 className={cn("mt-12", title)}>{guide.title}</h1>
      <p className={lede}>{guide.lede}</p>

      <DocMeta doc={guide} />

      <div className={stats}>
        <div>
          <div className={statN}>{guide.chapters.length}</div>
          <div className={statL}>Chapters</div>
        </div>
        <div>
          <div className={statN}>{rulesIn(guide)}</div>
          <div className={statL}>Rules</div>
        </div>
        <div>
          <div className={statN}>{casesIn(guide)}</div>
          <div className={statL}>Worked examples</div>
        </div>
        <div>
          <div className={statN}>{drillsIn(guide)}</div>
          <div className={statL}>Practice questions</div>
        </div>
      </div>

      <div className={block}>
        <h2 className={section}>What it is</h2>
        <p className="mt-2.5 leading-[1.7] text-muted-foreground text-pretty">{guide.intro}</p>
      </div>

      <div className={block}>
        <h2 className={section}>TL;DR</h2>
        <p className={tldr}>
          <Prose text={guide.tldr} />
        </p>
      </div>

      <div className={block}>
        <h2 className={section}>The chapters</h2>
        <div className="mt-2 border-t border-border">
          {guide.chapters.map((c) => (
            <Link
              className={cn(row, "border-b border-border")}
              key={c.slug}
              to={`/${guide.slug}/rules#${c.slug}`}
            >
              <span className={idx}>{c.n}</span>
              <span className={cn(rowName, "text-[15px] font-semibold text-pretty")}>{c.title}</span>
              <span className="flex-1" />
              <span className={cn(rowMeta, "tabular-nums")}>
                {c.rules.length} {c.rules.length === 1 ? "rule" : "rules"}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className={block}>
        <h2 className={section}>What each covers</h2>
        {guide.chapters.map((c, i) => (
          <Link
            className={cn("block border-b border-border py-4", i === 0 && "border-t")}
            key={c.slug}
            to={`/${guide.slug}/rules#${c.slug}`}
          >
            <div className="flex items-baseline gap-2">
              <span className={idx}>{c.n}</span>
              <span className="font-medium text-foreground text-pretty">{c.title}</span>
            </div>
            <p className="mt-1.5 pl-6 text-[15px] leading-relaxed text-muted-foreground text-pretty">
              {c.blurb}
            </p>
          </Link>
        ))}
      </div>

      <p className="mt-9">
        <Link className={ctaLink} to={`/${guide.slug}/rules`}>
          Read all {rulesIn(guide)} rules in full <span className={ctaArrow}>→</span>
        </Link>
      </p>
      <p className="mt-2.5">
        <Link className={ctaLink} to={`/${guide.slug}/practice`}>
          Take the practice — {drillsIn(guide)} scored answers <span className={ctaArrow}>→</span>
        </Link>
      </p>

      <CommentThread set={guide.slug} />
    </>
  );
}
