import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { COMMENTS_ENABLED } from "../comments/api";
import { SETS, getSet } from "../sets";
import { IconComment, IconDoc, IconLibrary, IconList, IconMenu, IconQuiz } from "./icons";

type Item = { href: string; label: string; mark: ReactNode; sep?: boolean };

/** The set you are inside, derived from the first path segment. */
function useSet() {
  const { pathname } = useLocation();
  return getSet(pathname.split("/")[1]);
}

/* Every entry carries a mark in a fixed-width slot: a numeral for the words, an
   icon for everything else. One slot width keeps the labels flush regardless of
   which kind of mark a row has. */
function useItems(): Item[] {
  const set = useSet();

  if (!set) {
    /* A numeral here would stutter against the label — "1 Vocabulary 1". */
    return [
      ...SETS.map((s) => ({
        href: `/${s.slug}`,
        label: s.title,
        mark: <IconDoc className="block h-3.5 w-3.5" />,
      })),
      // With no API configured the comments routes still resolve (a
      // directly-typed /comments URL explains itself) but there is nothing
      // to browse there, so the nav does not point at it.
      ...(COMMENTS_ENABLED
        ? [
            {
              href: "/comments",
              label: "All comments",
              mark: <IconComment className="block h-3.5 w-3.5" />,
              sep: true,
            },
          ]
        : []),
    ];
  }

  const items: Item[] = set.words.map((w) => ({
    href: `/${set.slug}/words?w=${w.slug}`,
    label: w.term,
    mark: <span className="text-[11.5px] font-semibold leading-none tabular-nums">{w.n}</span>,
  }));
  items.push({
    href: `/${set.slug}/words`,
    label: "All five",
    mark: <IconList className="block h-3.5 w-3.5" />,
    sep: true,
  });
  items.push({
    href: `/${set.slug}/quiz`,
    label: "Quiz",
    mark: <IconQuiz className="block h-3.5 w-3.5" />,
  });
  if (COMMENTS_ENABLED) {
    items.push({
      href: `/${set.slug}/comments`,
      label: "Comments",
      mark: <IconComment className="block h-3.5 w-3.5" />,
    });
  }
  items.push({
    href: "/",
    label: "All sets",
    mark: <IconLibrary className="block h-3.5 w-3.5" />,
    sep: true,
  });
  return items;
}

function useCurrent() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const set = useSet();
  const w = params.get("w");
  if (!set) return pathname === "/" ? "" : pathname;
  if (pathname === `/${set.slug}/comments`) return `/${set.slug}/comments`;
  if (pathname === `/${set.slug}/quiz`) return `/${set.slug}/quiz`;
  if (pathname === `/${set.slug}/words`)
    return w ? `/${set.slug}/words?w=${w}` : `/${set.slug}/words`;
  return `/${set.slug}`;
}

/* The mark inherits the link's colour, so both move together on hover. */
const markSlot = "flex h-4 w-4 flex-none items-center justify-center";

function Entry({
  it,
  current,
  className,
  tabIndex,
  onNavigate,
}: {
  it: Item;
  current: string;
  className: string;
  tabIndex?: number;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={it.href}
      className={className}
      aria-current={current === it.href ? "page" : undefined}
      onClick={onNavigate}
      tabIndex={tabIndex}
    >
      <span className={markSlot} aria-hidden="true">
        {it.mark}
      </span>
      <span>{it.label}</span>
    </Link>
  );
}

const railLink =
  "flex items-center gap-[9px] py-[3px] text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground aria-[current=page]:font-semibold aria-[current=page]:text-foreground";

/* Right-hand rail — persistent on wide viewports, mirrors the popover. */
export function Rail() {
  const items = useItems();
  const current = useCurrent();
  return (
    <nav
      className="fixed right-10 top-[78px] z-20 hidden flex-col gap-0.5 min-[1080px]:flex print:hidden"
      aria-label="Index"
    >
      {items.map((it) => (
        <span key={it.href} className="contents">
          {it.sep && <span className="my-2 h-px bg-border" aria-hidden="true" />}
          <Entry it={it} current={current} className={railLink} />
        </span>
      ))}
    </nav>
  );
}

const popLink =
  "flex items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-[7px] text-sm text-muted-foreground transition-colors duration-150 hover:bg-foreground/5 hover:text-foreground aria-[current=page]:font-semibold aria-[current=page]:text-foreground";

/* Wordmark + index popover. The popover scales from its trigger (top right),
   entering at 180ms and exiting at 130ms — exits run shorter than enters.
   Radius 12 outside, 6 inside with 6px padding: concentric. */
export function TopBar() {
  const set = useSet();
  const items = useItems();
  const current = useCurrent();
  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(false);
  const popRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!popRef.current?.contains(t) && !btnRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setInstant(true);
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="flex items-center justify-between gap-4">
      <Link
        className="inline-flex items-baseline gap-2 text-[15px] font-semibold leading-none tracking-[-0.005em] text-foreground"
        to="/"
        aria-label="Vocabulary — all sets"
      >
        Vocabulary
        <span className="text-[13px] font-medium tracking-[0.02em] text-muted-foreground">
          {set ? set.title.replace(/^Vocabulary /, "Set ") : "Library"}
        </span>
      </Link>

      <div className="relative flex items-center">
        <button
          ref={btnRef}
          className="relative -my-1.5 -mr-2 inline-flex h-[34px] w-[34px] items-center justify-center rounded-[9px] text-muted-foreground transition-[color,background-color,transform] duration-150 ease-out-quint after:absolute after:-inset-1.5 after:content-[''] hover:bg-foreground/5 hover:text-foreground active:scale-[0.97] motion-reduce:active:scale-100 print:hidden"
          type="button"
          aria-label={set ? "Jump to a word" : "Jump to a set"}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation();
            setInstant(e.detail === 0);
            setOpen((o) => !o);
          }}
        >
          <IconMenu className="block h-[18px] w-[18px]" />
        </button>

        <nav
          ref={popRef}
          className={
            "absolute right-0 top-[calc(100%+10px)] z-30 flex min-w-[180px] origin-top-right flex-col gap-0.5 rounded-xl bg-background p-1.5 shadow-pop transition-[opacity,transform] ease-out-quint motion-reduce:scale-100 " +
            (open
              ? "pointer-events-auto scale-100 opacity-100 duration-[180ms]"
              : "pointer-events-none scale-[0.97] opacity-0 duration-[130ms]")
          }
          aria-label="Index"
          style={instant ? { transitionDuration: "0ms" } : undefined}
        >
          {items.map((it) => (
            <span key={it.href} className="contents">
              {it.sep && <span className="mx-1.5 my-[5px] h-px bg-border" aria-hidden="true" />}
              <Entry
                it={it}
                current={current}
                className={popLink}
                tabIndex={open ? 0 : -1}
                onNavigate={() => setOpen(false)}
              />
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
