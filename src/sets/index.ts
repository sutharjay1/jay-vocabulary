/* ── Adding a new set ────────────────────────────────────────────────────────
   1. Copy vocabulary-1.ts to vocabulary-<n>.ts and fill it in from the new doc.
   2. Import it below and add it to SETS.
   Nothing else needs touching — the library cards, routes, rail, popover and
   every count are derived from this array.
   ─────────────────────────────────────────────────────────────────────────── */

import vocabulary1 from "./vocabulary-1";
import type { VocabSet } from "./types";

const ALL: VocabSet[] = [vocabulary1];

/** Newest first — the library lists the most recent set at the top. */
export const SETS: VocabSet[] = [...ALL].sort((a, b) => b.n - a.n);

export const LATEST: VocabSet = SETS[0];

export const getSet = (slug?: string): VocabSet | undefined =>
  SETS.find((s) => s.slug === slug);

export type { VocabSet, Word } from "./types";
export { examplesIn, synonymsIn, scoredIn, questionsIn } from "./types";
