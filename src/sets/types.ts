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

export type VocabSet = {
  /** URL segment, e.g. "vocabulary-1". */
  slug: string;
  /** Ordinal, used for the card mark and for sorting. */
  n: number;
  title: string;
  /** Source document this set was transcribed from. */
  file: string;
  /** One or two words on what the set covers. */
  theme: string;
  /** ISO date the document was received. */
  added: string;
  addedLabel: string;
  lede: string;
  /** Supports **bold** and _italic_ — see <Prose>. */
  tldr: string;
  words: Word[];
  quiz: Quiz;
};

/* ---- derived counts, so no set has to hand-maintain a number ---- */

export const examplesIn = (s: VocabSet) => s.words.reduce((a, w) => a + w.examples.length, 0);
export const synonymsIn = (s: VocabSet) => s.words.reduce((a, w) => a + w.synonyms.length, 0);

/** Scorable answers: matching contributes one per row. */
export const scoredIn = (s: VocabSet) =>
  s.quiz.partA.length + s.quiz.partB.length + s.quiz.partC.length;

/** Numbered questions, following the source document's own numbering, which
    leaves the matching table outside the sequence. */
export const questionsIn = (s: VocabSet) =>
  s.quiz.partA.length + s.quiz.partB.length + s.quiz.partD.length;
