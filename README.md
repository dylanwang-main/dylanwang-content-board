# Content Dashboard

A personal analytics dashboard for a short-form creator. It pulls posts and stats from Instagram, TikTok and YouTube, scores every post against the creator's own median, and tracks posting consistency.

**Live:** https://dylanwang-content-board.vercel.app (click "Explore the demo" for a sandbox with sample data, no signup)

## Why it exists

Instagram's Edits app, TikTok Studio and YouTube Studio already show raw numbers. What they don't answer:

- Was this post actually good **for me**, or did one viral video skew everything?
- What do my winners have in common?
- Am I posting consistently, or does it just feel like it?

This dashboard answers those three questions across all three platforms in one place.

## Features

- **Channel sync**: Instagram (Graph API), TikTok (Display API via OAuth), YouTube (Data API). Views, likes, comments, shares, saves, watch time.
- **Median-multiple scoring**: every post is compared to the median of the last 30 posts of the same kind (reels vs reels, Shorts vs Shorts) and tagged Outlier (3x+), Above (1.5x+), Normal or Flop (<0.5x).
- **Analysis**: hit rate, momentum (last 10 vs previous 10), a rolling-median trend line, and plain-English findings on what separates winners from the rest (day, time, length, caption, format, shares per 1K views). Findings only show when each group has 3+ posts and the gap is real.
- **Trial reel handling**: Instagram trial reels and grid-hidden reels are detected (`is_shared_to_feed = false`), hidden by default, and scored only against each other so they don't distort the real median.
- **Posting habits**: GitHub-style 6-month calendar, weekly goal, streak, average per week, longest gap.
- **AI breakdowns**: hook, summary and "why it works" for a post, using Claude. Runs in demo mode with no key, or with the visitor's own Anthropic key (stored in their browser only).
- **Guest demo**: an anonymous Supabase session seeded with a fictional creator's data, wiped after 24 hours by a cron job.

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | React, Vite, Tailwind, shadcn/ui, TanStack Query, Recharts |
| Data + auth | Supabase Postgres with row-level security, anonymous sign-ins, Storage |
| Server code | One Supabase Edge Function (`tiktok`) for the OAuth exchange and API proxy |
| Jobs | pg_cron (guest cleanup) |
| Hosting | Vercel |
| Tests | Node's built-in test runner (`npm test`) |

## Architecture notes

- **Thin backend on purpose.** Most logic runs in the browser against Supabase, with RLS (`created_by_id = auth.uid()`) as the security boundary. The only server code is where a secret is unavoidable: TikTok's client secret and token refresh live in the `tiktok` Edge Function, and its tokens sit in a table no browser role can read.
- **Two Instagram token types.** Meta's dashboard hands out either Instagram Login tokens (`IGAA…`, graph.instagram.com) or Facebook-style system user tokens (`EAA…`, graph.facebook.com with the IG account ID). `src/lib/instagram.js` detects which one and routes accordingly.
- **Pure analysis code.** Scoring, findings and habits (`src/lib/analysis.js`, `src/lib/habits.js`, `src/lib/mediaFilters.js`) are plain functions over one normalized post shape, which keeps them easy to test.
- **Migrated off Base44.** The app started as a Base44 project built from a course template. It was moved to Supabase + Vercel to drop the subscription and own the stack. The original Base44 functions run unchanged in the browser through a small compatibility layer (`src/api/db.js`, `src/functions/runtime.js`).

## Run locally

```bash
npm install
cp .env.example .env.local   # add your Supabase URL and anon key
npm run dev
npm test
```

Database schema lives in `supabase/migrations/`. The TikTok function lives in `supabase/functions/tiktok/` and needs `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET` set as Supabase secrets.

## Limits

- Instagram and TikTok apps run in development/sandbox mode, so only the owner's accounts can connect. Visitors use the demo workspace.
- Findings are correlations from a small sample, meant as things to test, not rules.
