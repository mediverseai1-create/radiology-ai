# RadiologyAI.online

Full-stack rebuild of the RadiologyAI.online platform (React + Vite + Tailwind v4 + Supabase).

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill the Supabase URL/anon key and checkout links.
3. Run `supabase/migrations/0001_init.sql` in the Supabase SQL editor.
4. Deploy the edge function: `supabase functions deploy ai` and set `GEMINI_API_KEY` via `supabase secrets set`.
5. `npm run dev`

## Structure
- `src/pages/Landing.tsx` marketing site, `Auth.tsx` sign in / up, `Legal.tsx` privacy + terms
- `src/pages/app/` workspace: studies, copilot, reporting, requests, patients, scribe, workforce, settings
- `supabase/` schema with RLS, credit metering and the `ai` edge function
