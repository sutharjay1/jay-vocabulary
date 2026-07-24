# Vocabulary

A study site for English study documents. One document per source file, each
with its own pages and its own practice.

Two kinds live side by side, told apart by `kind` on the document:

- **`vocab`** — a vocabulary set: definitions, synonyms, worked examples, quiz.
- **`grammar`** — a grammar guide: chapters of rules taught by correct/incorrect
  contrast, then scored practice.

Live: https://jay-vocabulary.vercel.app

## Routes

| Route | Kind | Purpose |
|---|---|---|
| `/` | both | Library — a card per document, newest first |
| `/:doc` | both | Overview — reference file, counts, TL;DR, index |
| `/:doc/comments` | both | The document's comment thread |
| `/:doc/words` | vocab | All words in full: definition, synonyms, every example |
| `/:doc/words?w=<word>` | vocab | One word: synonyms, examples on a spine, usage note |
| `/:doc/quiz` | vocab | Parts A–D. A/B/C are scored; D is open with model answers |
| `/:doc/rules` | grammar | Every chapter in full; `#<chapter>` deep-links to one |
| `/:doc/practice` | grammar | Pick the verb, then rewrite. Every item is scored |

So Vocabulary 1 lives at `/vocabulary-1`, `/vocabulary-1/words`,
`/vocabulary-1/quiz`; Subject–Verb Agreement at `/subject-verb-agreement`,
`/subject-verb-agreement/rules`, `/subject-verb-agreement/practice`.

A route belonging to the wrong kind redirects to the library, so
`/vocabulary-1/rules` resolves to `/`.

## Adding a new document

Everything on the site — the library cards, the rail, the popover, every count —
is derived from `src/sets/index.ts`. Adding a document is two steps:

1. **Copy the nearest existing file** — `src/sets/vocabulary-1.ts` for a set,
   `src/sets/subject-verb-agreement.ts` for a guide — and fill it in from the new
   document. Set `kind`, `slug`, `n`, `title`, `short`, `file`, `theme`, `added`
   and `addedLabel`, then either the `words`/`quiz` blocks or the
   `intro`/`chapters`/`practice` blocks. `tldr` accepts `**bold**` and
   `_italic_`, but not one inside the other — `<Prose>` splits, it does not
   parse.
2. **Register it in `src/sets/index.ts`:** import it and add it to `ALL`.

Nothing else needs touching. `kind` picks which pages the document gets, and
every count (words, rules, examples, questions, scored answers) is computed in
`src/sets/types.ts` — never hand-maintained.

`short` exists because the rail sits beside the measure rather than under it: a
heading-length label there would run into the text. Chapters carry one too.

```
src/sets/
  types.ts                    both shapes + derived counts
  vocabulary-1.ts             one file per document
  subject-verb-agreement.ts
  index.ts                    the registry — add new documents here
```

## Content policy

Definitions, synonyms, example sentences, rule statements, correct/incorrect
verdicts, reference tables, boxed asides and every quiz or practice item come
from the source document verbatim.

The additions are: parts of speech, the per-word usage note, the per-chapter
blurb, the `short`/`theme`/`lede`/`tldr` fields, the Part D model answers, and
the practice answer key with its one-line reasons — Subject_Verb_Agreement.docx
prints its exercises without a key. Each page says so in its footer.

## Design

Black and white only, Arimo at weight 500, a 42rem measure, and a hairline
leader that fades in on row hover. The right-hand rail marks each entry — a
numeral for words and chapters, an icon for everything else — in one
fixed-width slot so labels stay flush.

With no colour to spend, the grammar guide's correct/incorrect contrast borrows
the logic the quiz already uses for a chosen option: solid foreground for the
form to take, hairline outline for the one to avoid. Weight and fill carry it
visually; a visually-hidden "Correct"/"Incorrect" carries it for screen readers,
because fill alone is not an accessible signal.

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

### Comments

Comments are served by a Cloudflare Worker in `worker/`, backed by D1. The
frontend needs one variable:

```
VITE_COMMENTS_API=https://vocab-comments.sutharjay3635.workers.dev
```

Without it the comment surfaces are hidden and the rest of the site works
unchanged. Worker secrets (`ADMIN_TOKEN`, `IP_SALT`) live in Wrangler and are
never committed. See `worker/README.md` for deploys.
