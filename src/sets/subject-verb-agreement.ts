/* Transcribed from Subject_Verb_Agreement.docx. Every rule statement, example
   sentence, correct/incorrect verdict, reference table, callout and practice
   item is the document's own wording. The chapter blurbs, the `why` on each
   practice answer, and `short`, `theme`, `lede` and `tldr` are the additions —
   the document prints the practice options but no answer key. */

import type { GrammarGuide } from "./types";

const guide: GrammarGuide = {
  kind: "grammar",
  slug: "subject-verb-agreement",
  n: 2,
  title: "Subject–Verb Agreement",
  short: "Grammar",
  file: "Subject_Verb_Agreement.docx",
  theme: "Grammar",
  added: "2026-07-24",
  addedLabel: "24 Jul 2026",
  lede: "A short course on making subjects and verbs match in number — the basic rule, five rules that bend it, two mistakes learners make often, and practice.",
  intro:
    "Subject-verb agreement means that the verb must match the subject in number. A singular subject needs a singular verb, and a plural subject needs a plural verb. This rule sounds simple, but a few situations can make it tricky. This course walks through the basic rule, five common rules, common learner mistakes, two special cases and practice exercises.",
  tldr: "The whole subject is one sentence long: **the verb must match the subject in number**. Everything after that is learning to find the subject, because English keeps hiding it. It hides behind other nouns — in _the box of books is heavy_, the subject is the **box**, not the books. It moves, when **or** or **nor** joins two subjects and the verb agrees with whichever one is _closest_. It disguises itself as a plural when a collective noun acts as one unit, or when an amount of money or time counts as a single thing. The reliable move is always the same, and it is the one the document ends on: ask who or what is doing the action, ignore every word between that answer and the verb, then match.",

  chapters: [
    {
      slug: "basic-rule",
      n: 1,
      title: "The basic rule",
      short: "Basic rule",
      blurb:
        "Everything else in this guide is this one rule under pressure. A singular subject takes a singular verb; a plural subject takes a plural verb.",
      rules: [
        {
          slug: "singular",
          title: "Singular subject → singular verb",
          examples: [
            { text: "The dog runs fast.", verdict: "correct" },
            { text: "She writes every day.", verdict: "correct" },
            { text: "My friend is here.", verdict: "correct" },
          ],
        },
        {
          slug: "plural",
          title: "Plural subject → plural verb",
          examples: [
            { text: "The dogs run fast.", verdict: "correct" },
            { text: "They write every day.", verdict: "correct" },
            { text: "My friends are here.", verdict: "correct" },
          ],
        },
      ],
      pairs: {
        caption:
          "Notice that in the present tense, singular verbs often end in -s, while plural verbs do not.",
        head: ["Subject", "Verb"],
        rows: [
          ["He", "runs"],
          ["She", "writes"],
          ["It", "eats"],
          ["They", "run"],
          ["We", "write"],
          ["You", "eat"],
        ],
      },
    },

    {
      slug: "common-rules",
      n: 2,
      title: "Common rules",
      short: "Common rules",
      blurb:
        "Five situations where the subject is harder to find than it looks. Each one is the basic rule, applied after a second look.",
      rules: [
        {
          slug: "and",
          title: "Two subjects joined by “and” usually take a plural verb",
          examples: [
            { text: "Tom and Jerry are friends.", verdict: "correct" },
            { text: "Tom and Jerry is friends.", verdict: "incorrect" },
          ],
        },
        {
          slug: "or-nor",
          title: "Subjects joined by “or” or “nor”",
          gloss: "The verb agrees with the subject closest to it.",
          examples: [
            { text: "Either the teacher or the students are coming.", verdict: "correct" },
            { text: "Either the students or the teacher is coming.", verdict: "correct" },
          ],
        },
        {
          slug: "indefinite-pronouns",
          title: "Indefinite pronouns",
          gloss: "These are usually singular:",
          list: ["Everyone", "Somebody", "Anyone", "Nobody", "Each"],
          examples: [
            { text: "Everyone is ready.", verdict: "correct" },
            { text: "Each of the players has a uniform.", verdict: "correct" },
          ],
        },
        {
          slug: "collective-nouns",
          title: "Collective nouns",
          gloss:
            "Words like team, family, class and committee are usually singular when they act as one unit.",
          examples: [
            { text: "The team is winning.", verdict: "correct" },
            { text: "The class has finished the test.", verdict: "correct" },
          ],
        },
        {
          slug: "extra-words",
          title: "Do not be confused by extra words",
          gloss: "The subject determines the verb, not the words in between.",
          examples: [
            { text: "The box of books is heavy.", verdict: "correct" },
            { text: "The box of books are heavy.", verdict: "incorrect" },
          ],
          aside: "Subject = box (singular)",
        },
      ],
    },

    {
      slug: "common-mistakes",
      n: 3,
      title: "Common learner mistakes",
      short: "Mistakes",
      blurb: "These are two mistakes learners make often. Compare each one with the correct form.",
      rules: [
        {
          slug: "dont",
          title: "Third-person negatives with “don’t”",
          examples: [
            { text: "She don’t like coffee.", verdict: "incorrect" },
            { text: "She doesn’t like coffee.", verdict: "correct" },
          ],
        },
        {
          slug: "third-person-s",
          title: "Third-person verbs ending in -s",
          examples: [
            { text: "He go to school.", verdict: "incorrect" },
            { text: "He goes to school.", verdict: "correct" },
          ],
        },
      ],
      callout: {
        title: "Remember",
        steps: [
          "Always find the subject first.",
          "Ignore extra words between the subject and the verb.",
          "Then choose the verb that matches the subject.",
        ],
      },
    },

    {
      slug: "special-cases",
      n: 4,
      title: "Special cases",
      short: "Special cases",
      blurb:
        "Two constructions where the subject is not where the word order suggests it is.",
      rules: [
        {
          slug: "there-is-there-are",
          title: "There is / There are",
          gloss: "The verb agrees with the noun that follows.",
          examples: [
            { text: "There is a book on the table.", verdict: "correct" },
            { text: "There are three books on the table.", verdict: "correct" },
          ],
        },
        {
          slug: "amounts",
          title: "Amounts of money, time or distance",
          gloss: "When the amount is considered one unit, use a singular verb.",
          examples: [
            { text: "Ten dollars is enough.", verdict: "correct" },
            { text: "Five years is a long time.", verdict: "correct" },
          ],
        },
      ],
      callout: {
        title: "The easy trick",
        lede: "Ask yourself: “Who or what is doing the action?” Find the subject first, then match the verb to it.",
        worked: [
          {
            sentence: "The bouquet of flowers is beautiful.",
            reading: "Subject = bouquet (singular) → is",
          },
          {
            sentence: "The flowers in the vase are beautiful.",
            reading: "Subject = flowers (plural) → are",
          },
        ],
      },
    },
  ],

  practice: {
    drills: [
      {
        slug: "easy",
        title: "Easy",
        brief: "Choose the correct verb.",
        picks: [
          {
            n: 1,
            before: "The bird ",
            options: ["sing", "sings"],
            after: " in the morning.",
            answer: "sings",
            why: "One bird — a singular subject takes the -s form.",
          },
          {
            n: 2,
            before: "My parents ",
            options: ["is", "are"],
            after: " at home.",
            answer: "are",
            why: "Parents is plural, so the verb is plural.",
          },
          {
            n: 3,
            before: "He ",
            options: ["like", "likes"],
            after: " chocolate.",
            answer: "likes",
            why: "Third person singular takes the -s form.",
          },
          {
            n: 4,
            before: "The children ",
            options: ["play", "plays"],
            after: " in the park.",
            answer: "play",
            why: "Children is plural, so the verb drops the -s.",
          },
        ],
      },
      {
        slug: "medium",
        title: "Medium",
        brief: "The subject takes a second look.",
        picks: [
          {
            n: 5,
            before: "Either my brother or my parents ",
            options: ["is", "are"],
            after: " picking me up.",
            answer: "are",
            why: "With “or”, the verb agrees with the closest subject — parents.",
          },
          {
            n: 6,
            before: "Somebody ",
            options: ["leave", "leaves"],
            after: " their bag here every day.",
            answer: "leaves",
            why: "Somebody is an indefinite pronoun, and those are singular.",
          },
          {
            n: 7,
            before: "The committee ",
            options: ["meet", "meets"],
            after: " every Friday.",
            answer: "meets",
            why: "A collective noun acting as one unit is singular.",
          },
          {
            n: 8,
            before: "Neither the manager nor the employees ",
            options: ["was", "were"],
            after: " informed.",
            answer: "were",
            why: "With “nor”, the verb agrees with the closest subject — employees.",
          },
        ],
      },
      {
        slug: "mixed",
        title: "Mixed",
        brief: "Every rule in the guide, in no particular order.",
        picks: [
          {
            n: 9,
            before: "The list of items ",
            options: ["was", "were"],
            after: " long.",
            answer: "was",
            why: "Subject = list (singular). “Of items” is between the subject and the verb.",
          },
          {
            n: 10,
            before: "There ",
            options: ["is", "are"],
            after: " many reasons to celebrate.",
            answer: "are",
            why: "After “there”, the verb agrees with the noun that follows — reasons.",
          },
          {
            n: 11,
            before: "Twenty dollars ",
            options: ["is", "are"],
            after: " too much for that.",
            answer: "is",
            why: "An amount of money counted as one unit is singular.",
          },
          {
            n: 12,
            before: "One of the students ",
            options: ["has", "have"],
            after: " finished early.",
            answer: "has",
            why: "Subject = one (singular). “Of the students” does not change it.",
          },
        ],
      },
    ],
    fixBrief:
      "Each sentence has a verb that does not agree. Rewrite it so it does — punctuation and capitals are not marked.",
    fixes: [
      {
        n: 13,
        wrong: "The students in my class is studying.",
        answer: "The students in my class are studying.",
        why: "Subject = students (plural). “In my class” sits between it and the verb.",
      },
      {
        n: 14,
        wrong: "Everybody know the answer.",
        answer: "Everybody knows the answer.",
        why: "Everybody is an indefinite pronoun, so it takes the singular -s form.",
      },
      {
        n: 15,
        wrong: "My brother and sister was late.",
        answer: "My brother and sister were late.",
        why: "Two subjects joined by “and” take a plural verb.",
      },
    ],
  },
};

export default guide;
