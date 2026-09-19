# Codebase Structure

**Analysis Date:** 2026-09-19

## Directory Layout

```
echolearn/
├── .env.example          # Env var template (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
├── .oxlintrc.json        # Lint config (oxlint, react+typescript plugins)
├── index.html            # HTML entry; loads /src/main.tsx; Inter font
├── package.json          # React 19 + Vite 8 + Tailwind 4 + Supabase + WebLLM
├── tsconfig.json         # Project references → app + node configs
├── tsconfig.app.json     # App TS config (ES2023, bundler resolution, JSX react-jsx)
├── tsconfig.node.json    # Node-side TS config (vite config)
├── vite.config.ts        # Vite: react + tailwindcss plugins only
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── supabase/
│   ├── config.toml       # Edge Function config (ai-tutor, verify_jwt=false)
│   ├── .temp/            # CLI-generated local state (not source)
│   └── functions/
│       └── ai-tutor/     # Deno edge function: Gemini tutor proxy
│           ├── index.ts
│           ├── deno.json
│           └── .npmrc
├── dist/                 # Build output (generated)
└── src/
    ├── main.tsx          # App bootstrap: ReactDOM + AuthProvider
    ├── App.tsx           # Router: route table + protected-route gate
    ├── index.css         # Tailwind v4 + @theme design tokens
    ├── agents/           # AI/domain logic (pure TS, framework-agnostic)
    ├── assets/           # hero.png, vite.svg
    ├── components/       # React components (ui, layout, dashboard, shared)
    ├── contexts/         # React context providers (AuthContext)
    ├── data/             # Static data (mockData, mlKnowledgeBase)
    ├── hooks/            # Data-access hooks (useMockData)
    ├── lib/              # Infrastructure (supabase client, utils)
    ├── pages/            # Route-level screens
    └── types/            # Shared domain TypeScript types
```

## Directory Purposes

**`src/agents/` — AI and domain logic:**
- Purpose: Pure, framework-agnostic logic and AI wrappers used by pages
- Contains:
  - `adaptiveEngine.ts` — difficulty ladder, performance analysis, gap detection
  - `questionBank.ts` — static ML question pool + `getQuestions(topic?, difficulty?)`
  - `adaptiveQuestionAgent.ts` — next-question selection from bank + adaptive state
  - `offlineAI.ts` — **active** WebLLM singleton (prepare/restore/ask)
  - `localAI.ts` — unused older WebLLM wrapper (duplicate)
  - `offlineTutor.ts` — unused older WebLLM wrapper (duplicate)
  - `offlineAgent.ts` — localStorage offline assessment queue
  - `syncAgent.ts` — sync pending offline results when back online
  - `retrievalEngine.ts` — keyword retrieval over `mlKnowledgeBase` for RAG context

**`src/components/` — React components:**
- `ui/` — primitives: `Button.tsx`, `Card.tsx`, `Badge.tsx`, `Avatar.tsx`, `ProgressBar.tsx`, `ProgressRing.tsx`, `EmptyState.tsx`, `LoadingState.tsx`, `sign-in-card-2.tsx`, decorative `kinetic-grid.tsx`, `particles-bg.tsx`
- `layout/` — `AppLayout.tsx` (sidebar + topbar + Outlet), `Sidebar.tsx`, `TopBar.tsx`
- `dashboard/` — dashboard widgets: `AIDiscoveryHero.tsx`, `TopicProgressGrid.tsx`, `LearningMap.tsx`, `RecentActivity.tsx`, `LearningHealthCard.tsx`, `EchoPointsCard.tsx`, `ParentUpdateStatus.tsx`, `TodaysBestAction.tsx`
- `shared/` — `ActivityItem.tsx`, `AIInsightCard.tsx`, `TopicMasteryCard.tsx`

**`src/contexts/` — React context:**
- `AuthContext.tsx` — Supabase auth session state + `useAuth()` hook

**`src/data/` — static datasets:**
- `mockData.ts` — all mock domain data (user, topics, progress, gaps, discoveries, assessments, study plan, chart series)
- `mlKnowledgeBase.ts` — curriculum knowledge chunks (`KnowledgeChunk[]`) used by `retrievalEngine.ts`

**`src/hooks/` — data-access facade:**
- `useMockData.ts` — 18 typed hooks returning mock constants; **documented integration point for Supabase**

**`src/lib/` — infrastructure:**
- `supabase.ts` — singleton client from `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (throws if missing)
- `utils.ts` — `cn()` classname merge (clsx + tailwind-merge)

**`src/pages/` — route-level screens:**
- `Landing.tsx`, `Login.tsx`, `Signup.tsx` — public
- `Dashboard.tsx`, `Learn.tsx`, `TopicLearning.tsx`, `TeachBack.tsx`, `Assessment.tsx`, `Gaps.tsx`, `LearningPath.tsx`, `Progress.tsx`, `ParentUpdates.tsx` — protected
- `TopicLearning.backup.tsx` — **unused backup file (dead code)**

**`src/types/` — shared types:**
- `index.ts` — all domain interfaces (User, Topic, TopicProgress, LearningGap, AIDiscovery, Activity, Assessment, TeachBackSession, EchoPoints, ParentUpdate, StudyPlan, chart types)

**`supabase/functions/ai-tutor/` — server code:**
- `index.ts` — `Deno.serve` edge function; JWT auth → Gemini `generateContent` → reply

## Key File Locations

**Entry Points:**
- `index.html`: HTML shell, loads `/src/main.tsx`
- `src/main.tsx`: React root + `AuthProvider`
- `src/App.tsx`: Route table and protected-route gate
- `supabase/functions/ai-tutor/index.ts`: Edge Function entry (`Deno.serve`)

**Configuration:**
- `vite.config.ts`: react + tailwindcss plugins
- `tsconfig.app.json` / `tsconfig.node.json`: TS project refs
- `.oxlintrc.json`: lint rules
- `supabase/config.toml`: edge function config
- `.env.example`: env var template (copy to `.env`)

**Core Logic:**
- `src/agents/adaptiveEngine.ts`: adaptive difficulty/gap logic
- `src/agents/offlineAI.ts`: in-browser LLM singleton
- `src/agents/retrievalEngine.ts`: offline knowledge retrieval
- `src/contexts/AuthContext.tsx`: auth state management
- `src/hooks/useMockData.ts`: data-access layer (mock)

**Testing:**
- None. No test framework, no `*.test.*` / `*.spec.*` files, no test script in `package.json`

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g. `AIDiscoveryHero.tsx`, `ProgressRing.tsx`); exceptions: decorative FX `kinetic-grid.tsx`, `particles-bg.tsx`, `sign-in-card-2.tsx` are kebab-case
- Pages: `PascalCase.tsx` matching route feature (`TopicLearning.tsx`, `ParentUpdates.tsx`)
- Logic modules: `camelCase.ts` (e.g. `adaptiveEngine.ts`, `questionBank.ts`, `retrievalEngine.ts`)
- Types: `index.ts` per `src/types/`

**Directories:**
- All lowercase singular nouns (`agents`, `components`, `contexts`, `data`, `hooks`, `lib`, `pages`, `types`)
- Sub-components grouped by role: `components/ui`, `components/layout`, `components/dashboard`, `components/shared`

## Where to Add New Code

**New Feature:**
- Primary code: a new `src/pages/<Feature>.tsx` + route in `src/App.tsx` + composed widgets in `src/components/dashboard/` or a feature-specific component for the Dashboard
- Data access: add a typed hook in `src/hooks/useMockData.ts` (or a new file in `src/hooks/`) — do not query Supabase inline in the component
- Types: extend `src/types/index.ts`
- Tests: `src/hooks` component/page colocated (none exist yet — establish the pattern in `src/pages/<Feature>.test.tsx` or `src/hooks/<hook>.test.ts`)

**New Component/Module:**
- Implementation: `src/components/ui/<Name>.tsx` for primitives (import `cn` from `src/lib/utils.ts`, follow `Button.tsx` variants pattern); `src/components/layout/` for shell pieces; `src/components/shared/` for cross-page cards
- AI/domain logic: `src/agents/<name>.ts` (pure functions, no React imports)

**Utilities:**
- Shared helpers: `src/lib/utils.ts`
- New agent logic that needs the LLM: reuse `src/agents/offlineAI.ts` exports — do NOT create another WebLLM wrapper

**Server-side logic:**
- New Supabase edge function: `supabase/functions/<name>/index.ts` + register in `supabase/config.toml`

## Special Directories

**`dist/`:**
- Purpose: Vite build output
- Generated: Yes
- Committed: No (gitignored)

**`node_modules/`:**
- Purpose: Dependencies
- Generated: Yes
- Committed: No (gitignored)

**`supabase/.temp/`:**
- Purpose: Supabase CLI local state (`cli-latest`, `gotrue-version`, `linked-project.json`, `pooler-url`, `project-ref`, etc.)
- Generated: Yes
- Committed: No

**`src/pages/TopicLearning.backup.tsx`:**
- Purpose: Superseded copy of TopicLearning (dead code)
- Generated: No
- Committed: Yes — should be deleted (see CONCERNS/ARCHITECTURE)

**`src/assets/`:**
- Purpose: Static images (`hero.png`, `vite.svg`)
- Generated: No — committed static assets

---

*Structure analysis: 2026-09-19*