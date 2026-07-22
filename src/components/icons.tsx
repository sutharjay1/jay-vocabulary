/* 24×24 stroke icons on a shared grid so their optical weight matches the
   numerals they sit beside in the rail. currentColor throughout. */

type P = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconList = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h10" />
  </svg>
);

export const IconQuiz = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9.2 8.7a2.8 2.8 0 1 1 3.6 3.4c-.7.3-1.1 1-1.1 1.7v.4" />
    <path d="M11.7 18h.01" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);

export const IconLibrary = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="4" width="7" height="16" rx="1.6" />
    <rect x="13.5" y="4" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="13" width="7" height="7" rx="1.6" />
  </svg>
);

export const IconMenu = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 5.5h4" />
    <path d="M4 12h4" />
    <path d="M4 18.5h4" />
    <path d="M12 5.5h8" />
    <path d="M12 12h8" />
    <path d="M12 18.5h8" />
  </svg>
);

/* Page with a folded corner — the mark on each library card. */
export const IconDoc = (p: P) => (
  <svg {...base} {...p}>
    <path d="M14 3.5H7.5A1.5 1.5 0 0 0 6 5v14a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19V7.5z" />
    <path d="M14 3.5V7a.5.5 0 0 0 .5.5H18" />
    <path d="M9 13h6" />
    <path d="M9 16.5h4" />
  </svg>
);

export const IconArrow = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12h13" />
    <path d="M13 6.5 18.5 12 13 17.5" />
  </svg>
);
