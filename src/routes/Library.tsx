import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SETS } from "../sets";
import { IconArrow } from "../components/icons";
import { mono } from "../ui";

export default function Library() {
  return (
    <section className="mt-12 flex flex-col gap-2.5" aria-label="Sets">
      {SETS.map((s) => (
        <Link
          className={cn(
            "group block rounded-lg border border-border p-4 px-[18px]",
            "transition-[border-color,transform] duration-200 ease-out-quint",
            "hover:border-border-strong active:scale-[0.99] motion-reduce:active:scale-100",
            "max-sm:px-4 max-sm:py-[15px]"
          )}
          key={s.slug}
          to={`/${s.slug}`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[17px] font-semibold leading-[1.3] tracking-[-0.005em] text-foreground max-sm:text-base">
              {s.title}
            </span>
            <IconArrow className="block h-[15px] w-[15px] flex-none text-muted-foreground transition-[transform,color] duration-200 ease-out-quint group-hover:translate-x-[3px] group-hover:text-foreground motion-reduce:group-hover:translate-x-0" />
          </div>

          <span className={cn("mt-1 block text-muted-foreground", mono)}>{s.file}</span>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
            {s.words.map((w, i) => (
              <span className="contents" key={w.slug}>
                {i > 0 && <span aria-hidden="true">·</span>}
                <span>{w.term}</span>
              </span>
            ))}
          </div>
        </Link>
      ))}
    </section>
  );
}
