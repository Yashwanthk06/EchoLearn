<!-- refreshed: 2026-09-19 -->
# Architecture

**Analysis Date:** 2026-09-19

## System Overview

EchoLearn is a client-rendered React SPA (Vite + TypeScript) for adaptive Machine-Learning tutoring. It has **two AI tutoring paths**: an online path via a Supabase Edge Function calling Google Gemini, and an offline path via a WebLLM model running entirely in the browser. Auth is Supabase-backed; nearly all domain data currently comes from a mock-data layer that is designed to be swapped for Supabase queries.

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser (React 19 SPA)                        │
│                                                                      │
│  Pages (src/pages/) ── components (src/components/)                 │
│    │                             │                                   │
│    ▼                             ▼                                   │
│  Hooks layer          ┌───────────────────────────────┐              │
│  src/hooks/           │       Data access (mixed)     │              │
│  useMockData.ts ──► mockData (src/data/mockData.ts)   │              │
│                       │  inline supabase calls in⚠    │              │
│                       └───────────────────────────────┘              │
│    │                             │                                   │
│    ▼                             ▼                                   │
│  Agents (src/agents/)  ┌─────────────────────────────────┐           │
│  adaptiveEngine,       │  Supabase client (src/lib/)     │           │
│  questionBank,         │  auth + functions + db          │           │
│  offlineAI, offline    │  (VITE_SUPABASE_*)              │           │
│  sync, retrieval       │                                 │           │
│  └─────────► WebLLM    └───────────────┬─────────────────┘           │
│              engine (in-browser LLM)   │                             │
└────────────────────────────────────────│─────────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Supabase (cloud)                                  │
│  · Auth (email/password)                                             │
│  · Edge Function `ai-tutor` → Google Gemini (gemini-3.6-flash)       │
│  · Postgres DB (queries issued directly from components)              │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| App | Route table, protected-route gate | `src/App.tsx` |
| AuthProvider | Supabase auth session state, signIn/signUp/signOut | `src/contexts/AuthContext.tsx` |
| Pages (14) | Route-level features: Dashboard, Learn, TopicLearning, Assessment, TeachBack, Gaps, Progress, LearningPath, ParentUpdates, Login, Signup, Landing | `src/pages/*` |
| Mock data hooks | Data-access facade returning mock domain data; documented swap point for Supabase | `src/hooks/useMockData.ts` |
| UI primitives | Button, Card, Badge, Avatar, ProgressBar/Ring, inputs, decorative FX | `src/components/ui/` |
| Layout | Sidebar + TopBar shell with Outlet; particles background | `src/components/layout/AppLayout.tsx` |
| Dashboard cards | Per-widget cards composing the Dashboard page | `src/components/dashboard/` |
| Adaptive engine | Pure functions: difficulty switching, gap detection, recommendations | `src/agents/adaptiveEngine.ts` |
| Question bank | Static ML question pool (Easy/Medium/Hard per topic) | `src/agents/questionBank.ts` |
| Offline AI | WebLLM wrapper: lazy engine init, cache restore, prepared-marker in localStorage | `src/agents/offlineAI.ts` |
| Retrieval engine | TF-free keyword scoring over `mlKnowledgeBase` for RAG context | `src/agents/retrievalEngine.ts` |
| Offline sync | localStorage queue of offline assessment results + sync on reconnect | `src/agents/offlineAgent.ts`, `src/agents/syncAgent.ts` |
| Supabase Edge Function | Server tutor: auth check → Gemini call → reply | `supabase/functions/ai-tutor/index.ts` |

## Pattern Overview

**Overall:** Layered SPA with a thin mock-data facade. Page → hook → data is the intended vertical slice; AI logic is separated into a pure "agents" module layer.

**Key Characteristics:**
- Client-side routing only; no SSR/backend app server — the only server code is the Supabase Edge Function
- Data access is **not yet unified**: `src/hooks/useMockData.ts` returns mocks, while several pages/components query Supabase inline (`supabase.auth.getUser()`, `supabase.from(...)`, `supabase.functions.invoke('ai-tutor')`)
- Two parallel AI implementations exist: cloud Gemini (edge function) and in-browser WebLLM; `src/pages/TopicLearning.tsx` is the only page wired to the offline path (`src/agents/offlineAI.ts`)
- Domain types are centralized in one file (`src/types/index.ts`) and imported everywhere — including page-local re-declarations in some pages (e.g. `src/pages/ParentUpdates.tsx`, `src/pages/Gaps.tsx` define their own local `type ParentUpdate` / `type LearningGap`)

## Layers

**Entry:**
- Purpose: Bootstraps React, mounts AuthProvider, renders the router
- Location: `src/main.tsx`
- Contains: `ReactDOM.createRoot` render of `<AuthProvider><App/></AuthProvider>`
- Depends on: `src/contexts/AuthContext.tsx`, `src/App.tsx`

**Routing:**
- Purpose: Declarative route table, public vs protected routes, layout outlet
- Location: `src/App.tsx`
- Contains: `BrowserRouter` + `Routes`; `ProtectedRoutes` wrapper redirects to `/login` when unauthenticated and renders `AppLayout` (which provides the `<Outlet/>`)
- Depends on: `src/contexts/AuthContext.tsx`, `src/components/layout/AppLayout.tsx`
- Used by: `src/main.tsx`

**Pages:**
- Purpose: Route-level feature screens composed from components, hooks, and agents
- Location: `src/pages/`
- Contains: `Login.tsx`, `Signup.tsx`, `Landing.tsx` (not routed), `Dashboard.tsx`, `Learn.tsx`, `TopicLearning.tsx`, `TeachBack.tsx`, `Assessment.tsx`, `Gaps.tsx`, `LearningPath.tsx`, `Progress.tsx`, `ParentUpdates.tsx`, `TopicLearning.backup.tsx` (unused backup)
- Depends on: `src/components/*`, `src/hooks/*`, `src/agents/*`, `src/lib/supabase.ts`, `src/data/mockData.ts`
- Used by: `src/App.tsx`

**Components:**
- Purpose: Reusable presentation; four sub-layers
- Location: `src/components/` — `ui/` (primitives), `layout/` (shell), `dashboard/` (dashboard widgets), `shared/` (`ActivityItem.tsx`, `AIInsightCard.tsx`, `TopicMasteryCard.tsx`)
- Depends on: `src/lib/utils.ts`, `src/types/`, `framer-motion`, `lucide-react`

**Agents (domain/AI logic):**
- Purpose: Pure logic + AI wrappers, framework-agnostic
- Location: `src/agents/`
- Contains: `adaptiveEngine.ts`, `adaptiveQuestionAgent.ts`, `questionBank.ts`, `offlineAI.ts`, `localAI.ts`, `offlineTutor.ts`, `offlineAgent.ts`, `syncAgent.ts`, `retrievalEngine.ts`
- Depends on: `@mlc-ai/web-llm` (3 wrappers), `src/data/mlKnowledgeBase.ts`, `src/agents/adaptiveEngine.ts`

**Data:**
- Purpose: Static datasets
- Location: `src/data/` — `mockData.ts` (all domain mocks), `mlKnowledgeBase.ts` (curriculum chunks used by retrieval)
- Consumed by: `src/hooks/useMockData.ts`, `src/agents/retrievalEngine.ts`, `src/pages/TopicLearning.tsx` (directly imports `mockTopics`, `mockTopicProgress`)

**Infrastructure lib:**
- Purpose: Singleton Supabase client + classname helper
- Location: `src/lib/supabase.ts`, `src/lib/utils.ts`
- Depends on: `@supabase/supabase-js`, `clsx`, `tailwind-merge`

## Data Flow

### Primary Request Path (page load, mock mode)

1. Router matches route in `src/App.tsx` → renders page component
2. Page calls hooks from `src/hooks/useMockData.ts` (e.g. `useTopics()`, `useTopicWithProgress()`) which return constants from `src/data/mockData.ts`
3. Page composes UI components (`src/components/ui/*`) with mock data
4. Auth state comes from `src/contexts/AuthContext.tsx` → `src/lib/supabase.ts` session

### Online AI Tutor Flow (Teach Back / Topic chat)

1. Student submits a message in `src/pages/TeachBack.tsx` or `src/pages/TopicLearning.tsx`
2. Component calls `supabase.functions.invoke('ai-tutor', ...)` with message + history
3. Edge Function `supabase/functions/ai-tutor/index.ts` verifies the JWT (`supabase.auth.getUser()`), reads `GEMINI_API_KEY` from `Deno.env`, POSTs to Gemini `generateContent`
4. Reply is returned to the page and rendered (Gemini)

### Offline AI Tutor Flow (TopicLearning only)

1. Session start: `prepareOfflineAI` / `restoreOfflineAI` in `src/agents/offlineAI.ts` create a WebLLM `MLCEngine` (`Llama-3.2-1B-Instruct-q4f16_1-MLC`); a `localStorage` marker (`echolearn_offline_ai_prepared`) lets a refresh reload from browser cache
2. Question `askOfflineAI(question)` → `src/agents/retrievalEngine.ts` scores `src/data/mlKnowledgeBase.ts` chunks → top-4 chunks injected into system prompt → `engine.chat.completions.create(...)`
3. Fallback: if offline AI is not ready, the page falls back to `supabase.functions.invoke('ai-tutor')` (`src/pages/TopicLearning.tsx:530`)

### Offline Assessment Sync Flow

1. `src/pages/Assessment.tsx` saves results with `saveOfflineAssessment()` → JSON array in `localStorage` key `echolearn_offline_assessments` (`src/agents/offlineAgent.ts`)
2. `syncPendingAssessments(saveToSupabase)` in `src/agents/syncAgent.ts` iterates pending items, calls the caller-supplied `saveToSupabase` callback, marks synced on success
3. `onConnectionRestored(cb)` listens for the window `online` event

**State Management:**
- Auth: React context (`src/contexts/AuthContext.tsx`) driven by Supabase `onAuthStateChange` + `getSession`; `initialised` ref guards against the subscription callback clearing loading before the initial session resolves
- Domain data: no global store — data is mock constants returned per-hook
- Offline state: `localStorage` (assessment queue, learning gaps, offline-AI-prepared marker)
- UI state: local `useState` per page/component; `framer-motion` for animation

## Key Abstractions

**Mock-data hooks (`use*`):**
- Purpose: The intended seam between UI and the future Supabase data layer; comment in `src/hooks/useMockData.ts` states "These hooks are the integration points for Supabase. Replace the mock data returns with Supabase queries later."
- Examples: `useUser`, `useTopics`, `useTopicWithProgress`, `useLearningGaps`, `useAIDiscoveries`, `useActivities`, `useAssessments`, `useStudyPlan`, `useLearningMap`, `useMasteryTrend`, `useWeeklyStudy` — all in `src/hooks/useMockData.ts`
- Pattern: zero-arg hooks returning typed constants

**Offline AI engine:**
- Purpose: Single WebLLM engine singleton with lazy init, progress callback, and cache-restore semantics
- Examples: `src/agents/offlineAI.ts` (used by `src/pages/TopicLearning.tsx`)
- Pattern: module-level singleton (`let engine`), in-flight promise guard, localStorage prepared-marker

**Retrieval (RAG-lite):**
- Purpose: Offline, dependency-free keyword retrieval over the curriculum knowledge base
- Example: `src/agents/retrievalEngine.ts` — `calculateScore` weights topic/title/keyword/content matches; `buildKnowledgeContext` formats top-k chunks into the LLM system prompt

**Adaptive question selection:**
- Purpose: Next-question choice from a static bank based on difficulty ladder + weak topics
- Examples: `src/agents/adaptiveEngine.ts` (`getNextDifficulty`, `analyzePerformance`, `detectLearningGaps`), `src/agents/adaptiveQuestionAgent.ts` (`selectNextQuestion`), `src/agents/questionBank.ts`
- Pattern: pure functions over `AnswerRecord[]` / `AdaptiveState`

**Edge Function tutor:**
- Purpose: Server-side Gemini proxy with JWT auth, CORS, conversation history trim (last 8 messages)
- Example: `supabase/functions/ai-tutor/index.ts`

## Entry Points

**Web app:**
- Location: `src/main.tsx`
- Triggers: static `src/index.html` script tag
- Responsibilities: mount React root, wrap with `AuthProvider`

**Router:**
- Location: `src/App.tsx`
- Triggers: `BrowserRouter` on first paint
- Responsibilities: public (`/login`, `/signup`) vs protected (`/`, `/home`, `/dashboard`, `/learn`, `/learn/:topicId`, `/teach-back`, `/assessment`, `/gaps`, `/learning-path`, `/progress`, `/parent-updates`) routes; unknown → `/`; protected gate redirects to `/login` when loading/unauthenticated

**Edge Function:**
- Location: `supabase/functions/ai-tutor/index.ts` (`Deno.serve`)
- Triggers: HTTP POST from `supabase.functions.invoke('ai-tutor', ...)`
- Responsibilities: CORS preflight, JWT verification, Gemini call, error mapping

## Architectural Constraints

- **Threading:** Single-threaded browser. WebLLM inference runs on the main thread (no Web Worker) — long token generation can block UI; the 1B-parameter model is chosen to keep this acceptable
- **Global state:** Module-level singletons in the agents layer: `let engine` in `src/agents/offlineAI.ts`, `src/agents/localAI.ts`, `src/agents/offlineTutor.ts` (three separate copies); shared `supabase` client singleton in `src/lib/supabase.ts`
- **Circular imports:** None detected. Agent modules import downward only (`adaptiveQuestionAgent → questionBank/adaptiveEngine`; `offlineAI → retrievalEngine → data/mlKnowledgeBase`)
- **Offline-first constraint:** The offline path must work with zero network; hence localStorage queues and the prepared-marker restore strategy
- **No backend app server:** All server logic lives in Supabase (Edge Functions); there is no Express/Fastify/etc.

## Anti-Patterns

### Data layer not unified

**What happens:** Some features read mock data through `src/hooks/useMockData.ts` (Learn, LearningPath, Progress), while others query Supabase inline in the component body — e.g. `supabase.auth.getUser()` in `src/pages/Assessment.tsx`, `src/pages/Gaps.tsx`, `src/pages/ParentUpdates.tsx`, and the dashboard cards `src/components/dashboard/AIDiscoveryHero.tsx`, `src/components/dashboard/TopicProgressGrid.tsx`, `src/components/dashboard/LearningHealthCard.tsx`, `src/components/dashboard/ParentUpdateStatus.tsx`.
**Why it's wrong:** Two sources of truth per feature area; per-component auth fetching is duplicated ~7×; the mock seam is bypassed inconsistently.
**Do this instead:** Route all data access through `src/hooks/` (the documented integration point) so each feature has one typed hook backed by either mocks or Supabase.

### Triplicated WebLLM wrapper

**What happens:** Three nearly identical lazily-initialized WebLLM singletons exist: `src/agents/offlineAI.ts` (used by TopicLearning), `src/agents/localAI.ts`, `src/agents/offlineTutor.ts` (unused). All load the same model (`Llama-3.2-1B-Instruct-q4f16_1-MLC`).
**Why it's wrong:** Divergent behavior (one has prepared-marker restore, one throws on concurrent init, one lacks both); future model/download changes must be made three times.
**Do this instead:** Keep `src/agents/offlineAI.ts` (most complete), delete `localAI.ts` and `offlineTutor.ts`, and import the retained module everywhere.

### Duplicated question content

**What happens:** Assessment questions are hard-coded inline in `src/pages/Assessment.tsx` (`quizQuestions`) and duplicated in `src/agents/questionBank.ts` with the same/similar MCQs surfaced in `src/pages/Gaps.tsx` and `src/pages/TopicLearning.tsx` data.
**Why it's wrong:** Questions drift between copies; an edit to one bank does not apply elsewhere.
**Do this instead:** Single source in `src/agents/questionBank.ts`; import via `getQuestions()`.

### Committed backup file

**What happens:** `src/pages/TopicLearning.backup.tsx` is version-controlled and contains a superseded offline-AI integration (imports `askOfflineAI, initializeOfflineAI, isOfflineAIReady` from `src/agents/offlineAI.ts`).
**Why it's wrong:** Dead code; confusing for navigation and greps.
**Do this instead:** Delete the backup file — the current `TopicLearning.tsx` supersedes it.

### Page-local type re-declarations

**What happens:** `src/pages/Gaps.tsx` and `src/pages/ParentUpdates.tsx` declare local `LearningGap` / `ParentUpdate` types that overlap with `src/types/index.ts`, plus snake_case DB-shaped fields (`topic_id`, `mastery_score`, `parent_id`).
**Why it's wrong:** The central `src/types/index.ts` contract drifts from what pages actually use.
**Do this instead:** Extend the types in `src/types/index.ts` with Supabase row shapes and drop the local duplicates.

## Error Handling

**Strategy:** Try/catch at the operation site, returning user-facing error strings; AI failures degrade to fallback paths.

**Patterns:**
- Auth (`src/contexts/AuthContext.tsx`): errors returned as `{ error: Error | null }` result objects, never thrown
- Offline AI (`src/agents/offlineAI.ts`): init failures `console.warn` + clear prepared marker + return `false`; `askOfflineAI` throws when engine is uninitialized and the page catches it to fall back to Gemini
- Edge Function (`supabase/functions/ai-tutor/index.ts`): maps failure classes to HTTP codes (401 unauthorized, 400 missing message, 500 missing key/internal, 502 Gemini failure) with CORS headers
- Offline queue (`src/agents/offlineAgent.ts`): `JSON.parse` guarded; corrupt storage yields empty arrays with `console.error`

## Cross-Cutting Concerns

**Logging:** `console.log`/`console.warn`/`console.error` throughout agents and pages; no structured logger
**Validation:** Minimal — Edge Function validates message presence and trims history roles; env vars are validated at construction in `src/lib/supabase.ts` (throws if `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` missing)
**Authentication:** Supabase email/password via `AuthContext`; protected routes gate in `src/App.tsx`; Edge Function re-verifies the JWT server-side
**Styling:** Tailwind CSS v4 with design tokens in `@theme` (`src/index.css`); semantic color tokens (`--color-primary`, `--color-success`, `--color-danger`, `--color-error`) used via utility classes; `cn()` helper (`src/lib/utils.ts`) for composition
**Animations:** `framer-motion` variants pattern (`hidden`/`show` with stagger) at page level

---

*Architecture analysis: 2026-09-19*