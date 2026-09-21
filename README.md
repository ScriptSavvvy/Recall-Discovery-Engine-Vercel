# Recall — AI-Powered Photo Retrieval Discovery Engine

A Vercel-ready internal PM research prototype for analysing remembered-photo retrieval episodes. It separates observed account evidence from engine inference, supports side-by-side problem comparison, and preserves unknowns instead of forcing classifications.

## Research corpus

The application analyses 300 structured photo-retrieval accounts: 150 English and 150 Hinglish. Results are directional and should not be treated as prevalence estimates.

## Product sections

- Research overview with deterministic corpus distributions
- Side-by-side comparison of five primary problem families
- Retrieval journey explorer with nine filters and full record drill-down
- Dataset-grounded research assistant with eight curated questions
- Evidence-to-opportunity view that preserves uncertainties and next research needs

## Research model

`Target photo → retrieval purpose → remembered clues → forgotten information → actions/searches → observed difficulty → workaround → outcome`

Observed fields, inferred classifications, and interpretation limitations are shown separately.

## Architecture

```text
data/corpus.csv
   ↓
scripts/build-corpus.mjs
   ↓
data/corpus-300.json
   ↓
Next.js route handlers
   ├── GET  /api/evidence
   └── POST /api/research
   ↓
Interactive research workspace
```

Counts, percentages, rates, cross-tabs, and filtering are deterministic. The research endpoint performs dataset-bounded selection and synthesis and refuses unrelated questions.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run build
```

## Deploy to Vercel

```bash
npx vercel --prod
```

Keep Vercel's detected Next.js defaults. Do not override the Build Command, Development Command, or Output Directory. No environment variables or paid APIs are required.
