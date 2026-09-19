# Technology Stack

**Analysis Date:** 2026-09-19

## Languages

**Primary:**
- TypeScript ~6.0.2 - Entire frontend (`src/`), configured via `tsconfig.json` project references (`tsconfig.app.json`, `tsconfig.node.json`)
- TSX (JSX in TypeScript) - All React components and pages (`src/**/*.tsx`), compiled with `jsx: "react-jsx"`

**Secondary:**
- CSS - Tailwind CSS v4 with `@theme` token definitions in `src/index.css`
- Deno TypeScript - Supabase Edge Function runtime (`supabase/functions/ai-tutor/index.ts`)
- SQL (Supabase/Postgres) - Database schema is consumed by the frontend but migrations are **not present in this repo** (no `supabase/migrations/`)

## Runtime

**Environment:**
- Node.js v24.18.0 (observed local toolchain; no `.nvmrc`/`.node-version` pin)
- Browser SPA (client-rendered; `src/main.tsx` mounts to `#root`)
- Deno (Supabase Edge Functions) - `supabase/functions/ai-tutor/`

**Package Manager:**
- npm 12.0.1
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**
- React 19.2.8 - UI library (`src/main.tsx`, `src/App.tsx`)
- React DOM 19.2.8 - DOM renderer
- React Router DOM 7.18.3 - Client-side routing (`src/App.tsx` uses `BrowserRouter`, `Routes`, `Route`)
- Vite 8.3.0 - Build tool / dev server (`vite.config.ts`)
- Tailwind CSS 4.3.3 - Styling, integrated via `@tailwindcss/vite` plugin (`src/index.css`)
- Supabase JS 2.116.0 - Auth, Postgres access, Edge Function invocation (`src/lib/supabase.ts`)

**Testing:**
- Not detected. No test runner, assertion library, or test files exist in the repo.

**Build/Dev:**
- `@vitejs/plugin-react` 6.1.1 - React fast refresh / Oxc transform
- TypeScript ~6.0.2 - Type checking (`tsc -b` in `npm run build`)
- oxlint 1.81.0 - Linting (`npm run lint`, config in `.oxlintrc.json`)
- Supabase CLI 2.117.0 - Local Supabase / Edge Function tooling (devDependency)

## Key Dependencies

**Critical:**
- `@mlc-ai/web-llm` 0.2.85 - In-browser local LLM inference for the offline tutor. Loads `Llama-3.2-1B-Instruct-q4f16_1-MLC` (`src/agents/offlineAI.ts`, `src/agents/localAI.ts`, `src/agents/offlineTutor.ts`). Requires WebGPU.
- `@supabase/supabase-js` 2.116.0 - Auth session management, all Postgres reads/writes, and Edge Function calls (`src/lib/supabase.ts`)

**Infrastructure:**
- `framer-motion` 13.2.0 - Animation (`src/components/`)
- `recharts` 3.10.1 - Dashboard/progress charts (e.g. `src/components/dashboard/*`)
- `lucide-react` 1.45.0 - Icon set
- `clsx` 2.1.1 + `tailwind-merge` 3.7.0 - Class-name composition (`src/lib/utils.ts`)

## Configuration

**Environment:**
- Client env vars are Vite-prefixed and required; `src/lib/supabase.ts` throws if missing.
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Template: `.env.example`. A local `.env` exists (contents not inspected) and is gitignored.
- Edge Function server-side env (set in Supabase, read via `Deno.env.get`):
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `GEMINI_API_KEY`

**Build:**
- `vite.config.ts` - registers `react()` and `tailwindcss()` plugins only
- `tsconfig.json` → project references to `tsconfig.app.json` (app target `ES2023`, `moduleResolution: "bundler"`) and `tsconfig.node.json` (Vite config)
- `.oxlintrc.json` - plugins `react`, `typescript`, `oxc`; rules `react/rules-of-hooks` (error), `react/only-export-components` (warn)
- `supabase/config.toml` - registers `ai-tutor` function with `verify_jwt = false`, import map `./functions/ai-tutor/deno.json`

**Scripts (`package.json`):**
- `npm run dev` → `vite`
- `npm run build` → `tsc -b && vite build`
- `npm run lint` → `oxlint`
- `npm run preview` → `vite preview`

## Platform Requirements

**Development:**
- Node.js + npm
- A Supabase project (URL + anon key) to run authenticated flows
- WebGPU-capable browser for the offline WebLLM tutor (model downloads on first use, ~hundreds of MB, then browser-cached)

**Production:**
- Static SPA output (`dist/`) served from any static host / CDN
- Supabase project hosting Postgres, Auth, and the `ai-tutor` Edge Function
- Google Gemini API access via the Edge Function's `GEMINI_API_KEY`

---

*Stack analysis: 2026-09-19*
