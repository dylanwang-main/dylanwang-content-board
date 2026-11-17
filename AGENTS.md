# AGENTS.md

## Project Context

Content Dashboard: React + Vite frontend on Vercel, Supabase (Postgres with RLS, auth, storage, one edge function) as the backend. It was migrated off Base44; there is no Base44 CLI or SDK anymore. Start with `README.md`.

## Key Files

- `src/api/db.js`: Supabase client plus the Base44-compatible `api` shim (entities, auth, files, functions).
- `src/functions/`: the former Base44 functions, run in the browser through `src/functions/runtime.js`.
- `src/lib/analysis.js`, `src/lib/habits.js`, `src/lib/mediaFilters.js`: pure analysis logic, covered by tests.
- `supabase/migrations/`: schema, numbered. Add a new file per change.
- `supabase/functions/tiktok/`: TikTok OAuth exchange and API proxy.
- `.env.local`: local-only values (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); never commit secrets.

## Working Notes

- `npm run dev` for local work, `npm test` and `npm run build` before finishing.
- Keep secrets out of the browser: anything needing a client secret goes in an edge function.
- Every table uses RLS keyed on `created_by_id = auth.uid()`.
