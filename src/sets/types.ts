/* Two kinds of document live in the library: vocabulary sets, which teach a
   list of words, and grammar guides, which teach a body of rules. They share a
   card, a rail and a comment thread, so they share a base — but their bodies
   have nothing in common, so `kind` discriminates rather than one shape trying
   to cover both. */

type Base = {
  /** URL segment, e.g. "vocabulary-1". */
  slug: string;
  /** Ordinal, used for the card mark and for sorting. */
  n: number;
  title: string;
  /** Title shortened for the top bar, where the full one would crowd the mark. */
  short: string;
  /** Source document this set was transcribed from. */
  file: string;
  /** One or two words on what the document covers. */
  theme: string;
  /** ISO date the document was received. */
  added: string;
  addedLabel: string;
  lede: string;
  /** Supports **bold** and _italic_ — see <Prose>. */
  tldr: string;
};

/* ── Vocabulary sets ───────────────────────────────────────────────────────── */

export type Word = {
  slug: string;
  n: number;
  term: string;
  pos: string;
  definition: string;
  synonyms: string[];
  examples: string[];
  note: string;
};

export type Choice = { n: number; prompt: string; options: string[]; answer: number };
export type Blank = { n: number; before: string; after: string; answer: string };
export type Match = { n: number; item: string; answer: string };
export type Open = { n: number; prompt: string; lines?: string[]; model: string };

export type Quiz = {
  partA: Choice[];
  bank: string[];
  partB: Blank[];
  meanings: string[];
  partC: Match[];
  partD: Open[];
};

export type VocabSet = Base & {
  kind: "vocab";
  words: Word[];
  quiz: Quiz;
};

/* ── Grammar guides ────────────────────────────────────────────────────────── */

/** Every rule in the source is taught by contrast, so an example is never bare
    text — it is always a sentence plus the verdict the document gave it. */
export type Example = { text: string; verdict: "correct" | "incorrect" };

export type Rule = {
  slug: string;
  title: string;
  /** The document's own one-line statement of the rule, where it gives one. */
  gloss?: string;
  /** A short enumerated list belonging to the rule, e.g. the indefinite pronouns. */
  list?: string[];
  examples: Example[];
  /** The document's parse of the last example, e.g. "Subject = box (singular)". */
  aside?: string;
};

/** A two-column reference table — subject on the left, verb on the right. */
export type Pairs = { caption?: string; head: [string, string]; rows: [string, string][] };

/** A boxed aside in the source: either a numbered procedure or worked readings. */
export type Callout = {
  title: string;
  lede?: string;
  steps?: string[];
  worked?: { sentence: string; reading: string }[];
};

export type Chapter = {
  slug: string;
  n: number;
  title: string;
  /** Title cut to nav length. The rail sits beside the measure, not under it,
      so a heading-length label there would run into the text. */
  short: string;
  blurb: string;
  rules: Rule[];
  pairs?: Pairs;
  callout?: Callout;
};

/** Pick the verb that agrees. Two options, exactly as the document prints them. */
export type Pick = {
  n: number;
  before: string;
  options: [string, string];
  after: string;
  answer: string;
  /** Which rule settles it. An addition — the document supplies no key. */
  why: string;
};

/** Rewrite a sentence whose verb does not agree. */
export type Fix = { n: number; wrong: string; answer: string; why: string };

export type Drill = { slug: string; title: string; brief: string; picks: Pick[] };

export type Practice = { drills: Drill[]; fixBrief: string; fixes: Fix[] };

export type GrammarGuide = Base & {
  kind: "grammar";
  /** The document's own answer to "what is this?", printed verbatim. */
  intro: string;
  chapters: Chapter[];
  practice: Practice;
};

/* ── The union ─────────────────────────────────────────────────────────────── */

export type Doc = VocabSet | GrammarGuide;

export const isVocab = (d: Doc): d is VocabSet => d.kind === "vocab";
export const isGrammar = (d: Doc): d is GrammarGuide => d.kind === "grammar";

/* ── Derived counts, so no document has to hand-maintain a number ──────────── */

export const examplesIn = (s: VocabSet) => s.words.reduce((a, w) => a + w.examples.length, 0);
export const synonymsIn = (s: VocabSet) => s.words.reduce((a, w) => a + w.synonyms.length, 0);

/** Scorable answers: matching contributes one per row. */
export const scoredIn = (s: VocabSet) =>
  s.quiz.partA.length + s.quiz.partB.length + s.quiz.partC.length;

/** Numbered questions, following the source document's own numbering, which
    leaves the matching table outside the sequence. */
export const questionsIn = (s: VocabSet) =>
  s.quiz.partA.length + s.quiz.partB.length + s.quiz.partD.length;

export const rulesIn = (g: GrammarGuide) => g.chapters.reduce((a, c) => a + c.rules.length, 0);

export const casesIn = (g: GrammarGuide) =>
  g.chapters.reduce((a, c) => a + c.rules.reduce((b, r) => b + r.examples.length, 0), 0);

/** Every practice item is scored: the picks have two options, and the rewrites
    are compared loosely enough that punctuation cannot cost you a mark. */
export const drillsIn = (g: GrammarGuide) =>
  g.practice.drills.reduce((a, d) => a + d.picks.length, 0) + g.practice.fixes.length;

/* ── Cross-kind accessors, so the shared surfaces stay branch-free ─────────── */

/** What kind of document this is — the eyebrow on a library card. Only worth
    printing because the library now holds more than one kind. */
export const kindOf = (d: Doc): string => (isVocab(d) ? "Vocabulary set" : "Grammar guide");

/** The trail of contents printed under a library card. */
export const chipsOf = (d: Doc): string[] =>
  isVocab(d) ? d.words.map((w) => w.term) : d.chapters.map((c) => c.title);

/** The one-line "Contents" value on an overview page. */
export const contentsOf = (d: Doc): string =>
  isVocab(d)
    ? `${d.words.length} words · ${questionsIn(d)} quiz questions`
    : `${rulesIn(d)} rules · ${drillsIn(d)} practice questions`;
