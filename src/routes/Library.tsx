import { Link } from "react-router-dom";
import { SETS, examplesIn, questionsIn } from "../sets";
import { IconArrow } from "../components/icons";
import { mono, title } from "../ui";

export default function Library() {
  return (
    <>
      <h1 className={`mt-12 ${title}`}>Vocabulary library</h1>

      {/* Three lines per card: name, source file, counts. No shadow — the 1px
          hairline is the site's only surface language, and depth breaks it. */}
      <section className="mt-[34px] flex flex-col gap-2.5" aria-label="Sets">
        {SETS.map((s) => (
          <Link
            className="group block rounded-lg border border-border p-4 px-[18px] transition-[border-color,transform] duration-200 ease-out-quint hover:border-border-strong active:scale-[0.99] motion-reduce:active:scale-100 max-sm:px-4 max-sm:py-[15px]"
            key={s.slug}
            to={`/${s.slug}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[17px] font-semibold leading-[1.3] tracking-[-0.005em] text-foreground max-sm:text-base">
                {s.title}
              </span>
              <IconArrow className="block h-[15px] w-[15px] flex-none text-muted-foreground transition-[transform,color] duration-200 ease-out-quint group-hover:translate-x-[3px] group-hover:text-foreground motion-reduce:group-hover:translate-x-0" />
            </div>
            <span className={`mt-1 block text-muted-foreground ${mono}`}>{s.file}</span>
            <span className="mt-3 block text-[13px] tabular-nums text-muted-foreground">
              {s.words.length} words · {examplesIn(s)} examples · {questionsIn(s)} questions
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
