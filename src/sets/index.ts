/* ── Adding a new document ───────────────────────────────────────────────────
   Vocabulary set: copy vocabulary-1.ts, keep `kind: "vocab"`.
   Grammar guide:  copy subject-verb-agreement.ts, keep `kind: "grammar"`.
   Then import it below and add it to ALL. Nothing else needs touching — the
   library cards, routes, rail, popover and every count are derived from this
   array, and `kind` picks which pages the document gets.
   ─────────────────────────────────────────────────────────────────────────── */

import subjectVerbAgreement from "./subject-verb-agreement";
import vocabulary1 from "./vocabulary-1";
import type { Doc } from "./types";

const ALL: Doc[] = [vocabulary1, subjectVerbAgreement];

/** Newest first — the library lists the most recent document at the top. */
export const SETS: Doc[] = [...ALL].sort((a, b) => b.n - a.n);

export const LATEST: Doc = SETS[0];

export const getSet = (slug?: string): Doc | undefined => SETS.find((s) => s.slug === slug);

export type {
  Callout,
  Chapter,
  Doc,
  Example,
  Fix,
  GrammarGuide,
  Pairs,
  Pick,
  VocabSet,
  Word,
} from "./types";

export {
  casesIn,
  chipsOf,
  contentsOf,
  drillsIn,
  examplesIn,
  isGrammar,
  isVocab,
  kindOf,
  questionsIn,
  rulesIn,
  scoredIn,
  synonymsIn,
} from "./types";
