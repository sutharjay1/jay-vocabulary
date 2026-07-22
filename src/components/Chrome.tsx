import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { SETS, getSet } from "../sets";
import { IconDoc, IconLibrary, IconList, IconMenu, IconQuiz } from "./icons";

type Item = { href: string; label: string; mark: ReactNode; sep?: boolean };

/** The set you are inside, derived from the first path segment. */
function useSet() {
  const { pathname } = useLocation();
  return getSet(pathname.split("/")[1]);
}

/* Every rail and popover entry carries a mark in a fixed-width slot: a numeral
   for the words, an icon for everything else. One slot width keeps the labels
   flush regardless of which kind of mark a row has. */
function useItems(): Item[] {
  const set = useSet();

  if (!set) {
    /* A numeral here would stutter against the label — "1 Vocabulary 1". */
    return SETS.map((s) => ({
      href: `/${s.slug}`,
      label: s.title,
      mark: <IconDoc className="ico" />,
    }));
  }

  const items: Item[] = set.words.map((w) => ({
    href: `/${set.slug}/words?w=${w.slug}`,
    label: w.term,
    mark: <span className="num">{w.n}</span>,
  }));
  items.push({
    href: `/${set.slug}/words`,
    label: "All five",
    mark: <IconList className="ico" />,
    sep: true,
  });
  items.push({ href: `/${set.slug}/quiz`, label: "Quiz", mark: <IconQuiz className="ico" /> });
  items.push({ href: "/", label: "All sets", mark: <IconLibrary className="ico" />, sep: true });
  return items;
}

function useCurrent() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const set = useSet();
  const w = params.get("w");
  if (!set) return pathname === "/" ? "" : pathname;
  if (pathname === `/${set.slug}/quiz`) return `/${set.slug}/quiz`;
  if (pathname === `/${set.slug}/words`)
    return w ? `/${set.slug}/words?w=${w}` : `/${set.slug}/words`;
  return `/${set.slug}`;
}

function Entry({
  it,
  current,
  tabIndex,
  onNavigate,
}: {
  it: Item;
  current: string;
  tabIndex?: number;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={it.href}
      aria-current={current === it.href ? "page" : undefined}
      onClick={onNavigate}
      tabIndex={tabIndex}
    >
      <span className="mark" aria-hidden="true">
        {it.mark}
      </span>
      <span className="lbl">{it.label}</span>
    </Link>
  );
}

/* Right-hand rail — persistent on wide viewports, mirrors the popover. */
export function Rail() {
  const items = useItems();
  const current = useCurrent();
  return (
    <nav className="rail" aria-label="Index">
      {items.map((it) => (
        <span key={it.href} style={{ display: "contents" }}>
          {it.sep && <span className="railsep" aria-hidden="true" />}
          <Entry it={it} current={current} />
        </span>
      ))}
    </nav>
  );
}

/* Wordmark + index popover. The popover scales from its trigger (top right),
   entering at 180ms and exiting at 130ms — exits run shorter than enters. */
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
    <div className="topbar">
      <Link className="wordmark" to="/" aria-label="Vocabulary — all sets">
        Vocabulary<span className="sub">{set ? set.title.replace(/^Vocabulary /, "Set ") : "Library"}</span>
      </Link>
      <div className="wnav">
        <button
          ref={btnRef}
          className="calbtn"
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
          <IconMenu />
        </button>
        <nav
          ref={popRef}
          className={"pop" + (open ? " open" : "")}
          aria-label="Index"
          style={instant ? { transitionDuration: "0ms" } : undefined}
        >
          {items.map((it) => (
            <span key={it.href} style={{ display: "contents" }}>
              {it.sep && <span className="popsep" aria-hidden="true" />}
              <Entry
                it={it}
                current={current}
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
