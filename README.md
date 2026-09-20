# Recall — Photo Retrieval Discovery Engine

A Vercel-ready Product Management research prototype for analysing why people struggle to retrieve a specific remembered photo when their memory is incomplete.

## What it includes

- An 800-record prototype analysis corpus
- Five proposed retrieval-friction themes
- Source-linked Evidence Explorer with search and filters
- Discoverability insight cards with supporting records
- Eight suggested research questions
- Server-side research synthesis API
- Staged retrieval, analysis and synthesis animation
- Responsive dark dashboard

## Data model

The generated corpus is stored in `data/corpus-800.json`. Each record includes:

- `id`
- `platform`
- `appSystem`
- `category`
- `text`
- `sourceUrl`
- `origin`

The `origin` field keeps source-linked evidence distinguishable from synthetic augmentation in the backend. Only source-linked records are returned by the Evidence Explorer and supporting-evidence APIs.

## Architecture

```text
CSV seed data
   ↓
scripts/build-corpus.mjs
   ↓
data/corpus-800.json
   ↓
Next.js server routes
   ├── GET  /api/evidence
   └── POST /api/research
   ↓
Interactive research dashboard
```

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm start
```

The build command regenerates the 800-record corpus before compiling the Next.js application.

## Deploy to Vercel

1. Push this folder to GitHub, GitLab or Bitbucket.
2. Import the repository into Vercel.
3. Keep the detected framework as **Next.js**.
4. Deploy without additional environment variables.

The app currently uses deterministic server-side synthesis, so no paid AI API is required.
