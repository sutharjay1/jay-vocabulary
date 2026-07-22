import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { WORDS } from "../data";

type Item = { href: string; label: string; sep?: boolean };

function useItems(): Item[] {
  const items: Item[] = WORDS.map((w) => ({
    href: `/words?w=${w.slug}`,
    label: w.term,
  }));
  items.push({ href: "/words", label: "All five", sep: true });
  items.push({ href: "/quiz", label: "Quiz" });
  return items;
}

function useCurrent() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const w = params.get("w");
  if (pathname === "/quiz") return "/quiz";
  if (pathname === "/words") return w ? `/words?w=${w}` : "/words";
  return "";
}

/* Right-hand rail — persistent on wide viewports, mirrors the popover. */
export function Rail() {
  const items = useItems();
  const current = useCurrent();
  return (
    <nav className="rail" aria-label="Vocabulary index">
      {items.map((it) => (
        <span key={it.href} style={{ display: "contents" }}>
          {it.sep && <span className="railsep" aria-hidden="true" />}
          <Link to={it.href} aria-current={current === it.href ? "page" : undefined}>
            {it.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}

/* Wordmark + index popover. The popover scales from its trigger (top right),
   enters at 180ms and exits at 130ms — exits run shorter than enters. */
export function TopBar() {
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
      <Link className="wordmark" to="/" aria-label="Vocabulary — overview">
        Vocabulary<span className="sub">Set 1</span>
      </Link>
      <div className="wnav">
        <button
          ref={btnRef}
          className="calbtn"
          type="button"
          aria-label="Jump to a word"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation();
            setInstant(e.detail === 0);
            setOpen((o) => !o);
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 5.5h4" />
            <path d="M4 12h4" />
            <path d="M4 18.5h4" />
            <path d="M12 5.5h8" />
            <path d="M12 12h8" />
            <path d="M12 18.5h8" />
          </svg>
        </button>
        <nav
          ref={popRef}
          className={"pop" + (open ? " open" : "")}
          aria-label="Vocabulary index"
          style={instant ? { transitionDuration: "0ms" } : undefined}
        >
          {items.map((it) => (
            <span key={it.href} style={{ display: "contents" }}>
              {it.sep && <span className="popsep" aria-hidden="true" />}
              <Link
                to={it.href}
                tabIndex={open ? 0 : -1}
                aria-current={current === it.href ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {it.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
