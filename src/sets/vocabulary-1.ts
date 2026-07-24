/* Transcribed from Vocabulary_doc_1.docx. Definitions, synonyms, example
   sentences and every quiz item are the document's own words. `pos`, `note`,
   `theme`, `lede`, `tldr` and the Part D model answers are the additions. */

import type { VocabSet } from "./types";

const set: VocabSet = {
  kind: "vocab",
  slug: "vocabulary-1",
  n: 1,
  title: "Vocabulary 1",
  short: "Set 1",
  file: "Vocabulary_doc_1.docx",
  theme: "Professional English",
  added: "2026-07-22",
  addedLabel: "22 Jul 2026",
  lede: "Five items that do quiet work in professional English — making a case, getting through something difficult, and looking back at it afterwards.",
  tldr: "Five items that do quiet work in professional English. Three are single words — **compelling**, **navigate** and **leverage** — and each one carries a physical image underneath the abstract sense: something pulls you, something is steered through, something is used as a lever. The other two are phrases. **Read the room** is about noticing a mood _and_ changing what you do because of it; noticing alone doesn’t count. **In hindsight** frames a judgement you could only reach once you knew the ending. Together they cover the three situations most professional writing keeps returning to: making a case, getting through something difficult, and looking back at it afterwards.",

  words: [
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
  ],

  quiz: {
    partA: [
      {
        n: 1,
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
        n: 2,
        prompt: "If someone has a compelling reason for doing something, their reason is:",
        options: [
          "difficult to understand",
          "weak and uncertain",
          "convincing and persuasive",
          "completely unrelated",
        ],
        answer: 2,
      },
    ],

    bank: ["navigate", "read the room", "in hindsight"],
    partB: [
      {
        n: 3,
        before: "",
        after: ", I should have asked more questions before accepting the offer.",
        answer: "in hindsight",
      },
      {
        n: 4,
        before: "A good manager knows how to ",
        after: " before giving difficult feedback.",
        answer: "read the room",
      },
      {
        n: 5,
        before: "She learned how to ",
        after: " cultural differences while working abroad.",
        answer: "navigate",
      },
    ],

    meanings: [
      "Use something to gain an advantage",
      "Understand the social atmosphere",
      "Highly convincing or engaging",
    ],
    partC: [
      { n: 1, item: "Compelling", answer: "Highly convincing or engaging" },
      { n: 2, item: "Leverage", answer: "Use something to gain an advantage" },
      { n: 3, item: "Read the room", answer: "Understand the social atmosphere" },
    ],

    partD: [
      {
        n: 6,
        prompt:
          "Your friend uses years of teaching experience to start a successful coaching business. Which vocabulary item best describes what they did, and why?",
        model:
          "Leverage. They took something they already had — years of teaching experience — and used it to gain an advantage in a new field. That is exactly the shape of the word: an existing asset turned into a better result.",
      },
      {
        n: 7,
        prompt: "Complete each sentence naturally.",
        lines: ["“The speaker made a compelling…”", "“In hindsight, I wish I had…”"],
        model:
          "“The speaker made a compelling case for rewriting the proposal from scratch.” · “In hindsight, I wish I had raised the concern in the first meeting instead of the fourth.”",
      },
    ],
  },
};

export default set;
