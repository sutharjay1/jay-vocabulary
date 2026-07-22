/* The full contents of Vocabulary_doc_1.docx, transcribed verbatim and typed.
   Nothing here is invented — definitions, synonyms, examples and quiz items are
   the document's own words. `pos` and `note` are the only editorial additions. */

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

export const WORDS: Word[] = [
  {
    slug: "compelling",
    n: 1,
    term: "Compelling",
    pos: "adjective",
    definition:
      "So interesting, convincing or powerful that it captures your attention or makes you believe something.",
    synonyms: ["Convincing", "Persuasive", "Powerful", "Engaging"],
    examples: [
      "She made a compelling argument for changing the policy.",
      "The documentary tells a compelling story about climate change.",
      "He gave a compelling reason for turning down the offer.",
    ],
    note: "Describes the thing doing the persuading — an argument, a story, a reason — not the person being persuaded.",
  },
  {
    slug: "navigate",
    n: 2,
    term: "Navigate",
    pos: "verb",
    definition:
      "To deal with or make your way through a difficult situation, process or relationship successfully.",
    synonyms: ["Manage", "Handle", "Work through", "Find your way through"],
    examples: [
      "It took time to navigate the challenges of my new role.",
      "She navigated the conversation carefully to avoid offending anyone.",
      "Learning how to navigate office politics is an important skill.",
    ],
    note: "The figurative sense. It carries the literal one with it — the difficulty has a shape you have to steer through.",
  },
  {
    slug: "leverage",
    n: 3,
    term: "Leverage",
    pos: "verb",
    definition:
      "To use something you already have in order to gain an advantage or achieve a better result.",
    synonyms: ["Use", "Capitalize on", "Make the most of", "Utilize"],
    examples: [
      "He leveraged his experience to secure a better position.",
      "We should leverage customer feedback to improve the product.",
      "She leveraged her network to find new opportunities.",
    ],
    note: "Always takes an object you already hold — experience, data, a network. You cannot leverage toward something, only leverage something.",
  },
  {
    slug: "read-the-room",
    n: 4,
    term: "Read the room",
    pos: "idiom",
    definition:
      "To notice and understand the feelings, mood or social dynamics of the people around you, then adjust your behavior accordingly.",
    synonyms: ["Sense the mood", "Pick up on the atmosphere", "Be socially aware"],
    examples: [
      "Before making a joke, read the room.",
      "She quickly read the room and realized it wasn’t the right time to bring up the issue.",
      "Good leaders know how to read the room during difficult conversations.",
    ],
    note: "Two halves: noticing the mood, and changing what you were going to do because of it. Noticing alone isn’t reading the room.",
  },
  {
    slug: "in-hindsight",
    n: 5,
    term: "In hindsight",
    pos: "adverbial phrase",
    definition: "Looking back on a situation after knowing the outcome.",
    synonyms: ["Looking back", "Afterward", "Upon reflection", "Retrospectively"],
    examples: [
      "In hindsight, I should have accepted the opportunity.",
      "The decision seemed risky at the time, but in hindsight it was the right one.",
      "In hindsight, the warning signs were obvious.",
    ],
    note: "Frames a judgement you could only make once you knew how it ended. It usually opens the sentence.",
  },
];

/* ---------- Quiz ---------- */

export type Choice = {
  kind: "choice";
  n: number;
  part: "A";
  prompt: string;
  options: string[];
  answer: number;
};

export type Blank = {
  kind: "blank";
  n: number;
  part: "B";
  before: string;
  after: string;
  answer: string;
};

export type Match = {
  kind: "match";
  n: number;
  part: "C";
  item: string;
  answer: string;
};

export type Open = {
  kind: "open";
  n: number;
  part: "D";
  prompt: string;
  lines?: string[];
  model: string;
};

export const PART_A: Choice[] = [
  {
    kind: "choice",
    n: 1,
    part: "A",
    prompt: "Which sentence uses leverage most naturally?",
    options: [
      "She leveraged to the station before work.",
      "We can leverage our existing data to make better decisions.",
      "He leveraged the meeting for two hours.",
      "The weather leveraged all afternoon.",
    ],
    answer: 1,
  },
  {
    kind: "choice",
    n: 2,
    part: "A",
    prompt: "If someone has a compelling reason for doing something, their reason is:",
    options: [
      "difficult to understand",
      "weak and uncertain",
      "convincing and persuasive",
      "completely unrelated",
    ],
    answer: 2,
  },
];

export const BLANK_BANK = ["navigate", "read the room", "in hindsight"];

export const PART_B: Blank[] = [
  {
    kind: "blank",
    n: 3,
    part: "B",
    before: "",
    after: ", I should have asked more questions before accepting the offer.",
    answer: "in hindsight",
  },
  {
    kind: "blank",
    n: 4,
    part: "B",
    before: "A good manager knows how to ",
    after: " before giving difficult feedback.",
    answer: "read the room",
  },
  {
    kind: "blank",
    n: 5,
    part: "B",
    before: "She learned how to ",
    after: " cultural differences while working abroad.",
    answer: "navigate",
  },
];

export const MATCH_MEANINGS = [
  "Use something to gain an advantage",
  "Understand the social atmosphere",
  "Highly convincing or engaging",
];

export const PART_C: Match[] = [
  { kind: "match", n: 1, part: "C", item: "Compelling", answer: MATCH_MEANINGS[2] },
  { kind: "match", n: 2, part: "C", item: "Leverage", answer: MATCH_MEANINGS[0] },
  { kind: "match", n: 3, part: "C", item: "Read the room", answer: MATCH_MEANINGS[1] },
];

export const PART_D: Open[] = [
  {
    kind: "open",
    n: 6,
    part: "D",
    prompt:
      "Your friend uses years of teaching experience to start a successful coaching business. Which vocabulary item best describes what they did, and why?",
    model:
      "Leverage. They took something they already had — years of teaching experience — and used it to gain an advantage in a new field. That is exactly the shape of the word: an existing asset turned into a better result.",
  },
  {
    kind: "open",
    n: 7,
    part: "D",
    prompt: "Complete each sentence naturally.",
    lines: ["“The speaker made a compelling…”", "“In hindsight, I wish I had…”"],
    model:
      "“The speaker made a compelling case for rewriting the proposal from scratch.” · “In hindsight, I wish I had raised the concern in the first meeting instead of the fourth.”",
  },
];

/* The document numbers its questions 1–7 and leaves the Part C matching table
   outside that numbering. TOTAL_SCORED counts scorable *answers* instead, which
   is a different number (8) because matching contributes three rows. */
export const TOTAL_QUESTIONS = PART_A.length + PART_B.length + PART_D.length;
export const TOTAL_SCORED = PART_A.length + PART_B.length + PART_C.length;
