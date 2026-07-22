# Vocabulary — Set 1

A small static study site for five items of professional English: **compelling**,
**navigate**, **leverage**, **read the room** and **in hindsight**. Definitions,
synonyms and worked examples, plus the document's four-part quiz made interactive.

Live: https://jay-vocabulary.vercel.app

## Routes

| Route | Purpose |
|---|---|
| `/` | Overview — the set at a glance, TL;DR, word index, definitions |
| `/words` | All five in full: definition, synonyms, every example sentence |
| `/words?w=<slug>` | One word: definition, synonyms, examples on a spine, usage note |
| `/quiz` | Parts A–D. A/B/C are scored (8 answers); D is open with model answers |

## Content

Every definition, synonym, example sentence and quiz item comes from
`Vocabulary_doc_1.docx` and lives in `src/data.ts`. Parts of speech, the short
usage note on each word, and the Part D model answers are the only additions.

## Design

Black and white only, Arimo at weight 500, a 42rem measure, and a hairline
leader that fades in on row hover. Motion follows the animations.dev doctrine:
transitions rather than keyframes, custom `--ease-out`, exits shorter than
enters, and `prefers-reduced-motion` drops movement while keeping fades.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # tsc -b && vite build → dist/
pnpm preview
```

Deployed on Vercel as a static SPA; `vercel.json` rewrites all paths to
`index.html` so `/words` and `/quiz` resolve on a hard refresh.
