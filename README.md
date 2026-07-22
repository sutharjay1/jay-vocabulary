# Vocabulary

A study site for vocabulary sets. One set per source document, each with its own
page: definitions, synonyms, worked examples and an interactive quiz.

Live: https://jay-vocabulary.vercel.app

## Routes

| Route | Purpose |
|---|---|
| `/` | Library — a card per set, newest first |
| `/:set` | Set overview — reference file, counts, TL;DR, word index, definitions |
| `/:set/words` | All words in full: definition, synonyms, every example |
| `/:set/words?w=<word>` | One word: synonyms, examples on a spine, usage note |
| `/:set/quiz` | Parts A–D. A/B/C are scored; D is open with model answers |

So Vocabulary 1 lives at `/vocabulary-1`, `/vocabulary-1/words`, `/vocabulary-1/quiz`.

## Adding a new set

Everything on the site — the library cards, the rail, the popover, every count —
is derived from `src/sets/index.ts`. Adding a set is two steps:

1. **Copy `src/sets/vocabulary-1.ts` to `src/sets/vocabulary-2.ts`** and fill it
   in from the new document. Set `slug`, `n`, `title`, `file`, `theme`, `added`
   and `addedLabel`, then the `words` and `quiz` blocks. `tldr` accepts
   `**bold**` and `_italic_`.
2. **Register it in `src/sets/index.ts`:** import it and add it to `ALL`.

Nothing else needs touching. Counts (words, examples, synonyms, questions,
scored answers) are computed in `src/sets/types.ts` — never hand-maintained.

```
src/sets/
  types.ts          shapes + derived counts
  vocabulary-1.ts   one file per document
  index.ts          the registry — add new sets here
```

## Content policy

Definitions, synonyms, example sentences and every quiz item come from the
source document verbatim. Parts of speech, the per-word usage note, the set
`theme`/`lede`/`tldr` and the Part D model answers are additions, and each page
says so in its footer.

## Design

Black and white only, Arimo at weight 500, a 42rem measure, and a hairline
leader that fades in on row hover. The right-hand rail marks each entry — a
numeral for words, an icon for everything else — in one fixed-width slot so
labels stay flush.

Motion follows the animations.dev doctrine: transitions rather than keyframes,
custom `--ease-out`, exits shorter than enters, hover states gated behind
`@media (hover: hover)`, and `prefers-reduced-motion` dropping movement while
keeping fades.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # tsc -b && vite build → dist/
pnpm preview
```

Deployed on Vercel as a static SPA; `vercel.json` rewrites non-asset paths to
`index.html` so deep links resolve on a hard refresh.
