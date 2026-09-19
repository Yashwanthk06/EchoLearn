# External Integrations

**Analysis Date:** 2026-09-19

## APIs & External Services

**AI / LLM:**
- Google Gemini API - Powers the online "EchoTutor" chat and Teach Back evaluation
  - SDK/Client: raw `fetch` inside the Supabase Edge Function (`supabase/functions/ai-tutor/index.ts`)
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent`
  - Auth: `x-goog-api-key` header, sourced from `GEMINI_API_KEY` (Supabase Edge Function secret)
  - Called from frontend via `supabase.functions.invoke('ai-tutor', { body })` in `src/pages/TopicLearning.tsx` and `src/pages/TeachBack.tsx`

- MLC WebLLM model CDN - Serves the in-browser offline model
  - SDK/Client: `@mlc-ai/web-llm` (`CreateMLCEngine`) in `src/agents/offlineAI.ts`, `src/agents/localAI.ts`, `src/agents/offlineTutor.ts`
  - Model: `Llama-3.2-1B-Instruct-q4f16_1-MLC`
  - Auth: none (public model artifacts), requires internet only for the first download

**Fonts:**
- Google Fonts - Inter typeface loaded in `index.html` via `<link>` preconnect + stylesheet

## Data Storage

**Databases:**
- Supabase Postgres
  - Connection: `VITE_SUPABASE_URL` (client), `SUPABASE_URL` (Edge Function)
  - Client: `@supabase/supabase-js` singleton in `src/lib/supabase.ts`
  - Tables referenced from frontend code (schema not versioned in repo):
    - `topics` - `src/pages/Gaps.tsx`, `src/pages/Assessment.tsx`, `src/components/layout/TopBar.tsx`, `src/components/dashboard/AIDiscoveryHero.tsx`, `src/components/dashboard/TopicProgressGrid.tsx`
    - `student_mastery` - `src/pages/Gaps.tsx`, `src/pages/Assessment.tsx`, `src/components/dashboard/LearningHealthCard.tsx`, `src/components/dashboard/TopicProgressGrid.tsx`
    - `concept_dependencies` - `src/pages/Gaps.tsx`, `src/components/dashboard/AIDiscoveryHero.tsx`
    - `assessments` - `src/pages/Assessment.tsx`
    - `student_answers` - `src/pages/Assessment.tsx`
    - `questions` - `src/pages/Assessment.tsx`
    - `parent_student_links` - `src/pages/ParentUpdates.tsx`
    - `parent_updates` - `src/pages/ParentUpdates.tsx`
  - Migrations: not present in this repo (`supabase/` contains only `config.toml`, `functions/`, and CLI `.temp/` state)

**File Storage:**
- None (no Supabase Storage usage detected). Static assets live in `public/` and `src/assets/`.

**Caching:**
- Browser LocalStorage - offline state and WebLLM readiness marker
  - `echolearn_offline_ai_prepared` - `src/agents/offlineAI.ts`
  - Offline assessment queue key (`STORAGE_KEY`) - `src/agents/offlineAgent.ts`
- Browser Cache Storage - WebLLM model weights cached after first download (`@mlc-ai/web-llm`)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (GoTrue), email + password
  - Implementation: `AuthProvider` / `useAuth` in `src/contexts/AuthContext.tsx`
  - Methods: `signInWithPassword`, `signUp`, `signOut`, `getSession`, `onAuthStateChange`
  - Route protection: `ProtectedRoutes` in `src/App.tsx` redirects unauthenticated users to `/login`
  - No third-party / social OAuth providers configured

## Monitoring & Observability

**Error Tracking:**
- None. No Sentry/Datadog/etc.

**Logs:**
- `console.error` / `console.warn` only
  - Edge Function errors logged server-side in `supabase/functions/ai-tutor/index.ts`
  - Client-side fallbacks logged in `src/pages/TopicLearning.tsx`

## CI/CD & Deployment

**Hosting:**
- Not configured in repo. Output is a static SPA (`dist/`) requiring an external static host.
- Backend services are Supabase-managed (Postgres, Auth, Edge Functions).

**CI Pipeline:**
- None detected (no `.github/`, no CI config files).

## Environment Configuration

**Required env vars:**
- Client (Vite, `VITE_` prefix): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Edge Function (Supabase secrets): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`

**Secrets location:**
- Local development: `.env` (gitignored; template at `.env.example`)
- Production: Supabase Edge Function secrets (configured in the Supabase dashboard/CLI)

## Webhooks & Callbacks

**Incoming:**
- `ai-tutor` Supabase Edge Function endpoint (HTTPS invocation, CORS `*`, `verify_jwt = false` at gateway; user identity is re-verified inside via `supabase.auth.getUser()`)

**Outgoing:**
- None. No outbound webhook delivery to third parties.

---

*Integration audit: 2026-09-19*
