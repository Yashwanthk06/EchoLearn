# Requirements: EchoLearn

**Defined:** 2026-09-19 (evidence-based baseline)
**Core Value:** Trace a student's mistakes back to missing prerequisites and adapt the next study step to close those gaps (inferred from code)

## Baseline Status Classes

Everything below reflects what the code currently *attempts* do, classified by
verified state on 2026-09-19. No class implies commitment to fix/build; the
roadmap is explicitly deferred until the owner reviews this baseline.

| Class | Meaning | Evidence used |
|-------|---------|---------------|
| `implemented` | Code present, wired, build-clean (static evidence) | build + code trace |
| `partial` | Wiring present but a segment is incomplete/blocked | code trace |
| `mock-only` | UI reads mock constants; Supabase backing empty | DB row counts |
| `broken` | Code present but fails in current environment | live-env test |
| `missing` | Referenced/intended but absent from repo | repo scan |
| `unverified` | Requires configured Supabase/WebGPU runtime to confirm | n/a (no runtime) |

Legend marker: `🔒` = runtime-unverified, `⚠` = gap found, `✗` = broken,
`✓` = verified in-environment.

## v1 Requirements (current product surface)

### Onboarding & Auth

- [partial] **AUTH-01**: User can sign up with email and password — `AuthContext.signUp` + Signup page wired; runtime unverified 🔒
- [implemented] **AUTH-02**: Session restored on refresh — `getSession` + `onAuthStateChange` with `initialised` ref guard; runtime unverified 🔒
- [broken] **AUTH-03**: Protected routes redirect unauthenticated users ✗ — gate works, **but first-time login redirect fails**: no `/auth-callback` route exists, post-login lands on `/` → bounced back to `/login` until manual refresh (`src/App.tsx`, verified by trace audit)
- [implemented] **AUTH-04**: User can log out — `signOut` wired to TopBar
- [partial] **AUTH-05**: AI Edge Function re-verifies the token server-side — `supabase.auth.getUser()` in `supabase/functions/ai-tutor/index.ts`; gateway `verify_jwt = false` + CORS `*` (relies on in-function check)

### Learn & Topics

- [mock-only] **LEARN-01**: User can browse a topic library — `Learn.tsx` → `useTopics` → mock; `topics` table empty (`SELECT count(*)` = 0)
- [partial] **LEARN-02**: User can open a topic and see titled curriculum content — `TopicLearning.tsx` (imports `mockTopics` directly, bypassing the hook seam); content is mock
- [implemented] **LEARN-03**: Topic page offers an AI tutor — online (Gemini via Edge Function) with offline (WebLLM) path and Gemini fallback (`TopicLearning.tsx:530`); runtime unverified 🔒

### Diagnostic Assessment & Adaptive Engine

- [partial] **ASSESS-01**: Adaptive diagnostic quiz per topic — `questionBank.ts` + `adaptiveQuestionAgent.selectNextQuestion` + `adaptiveEngine.getNextDifficulty`; question content duplicated inline in `Assessment.tsx` (`quizQuestions`) — drift risk
- [implemented] **ASSESS-02**: Difficulty ladder adapts to performance — pure functions in `src/agents/adaptiveEngine.ts`
- [implemented] **ASSESS-03**: Gap detection from answers — `detectLearningGaps` in `adaptiveEngine.ts`
- [broken] **ASSESS-04**: Assessment results persist to Supabase ✗ — `saveAssessmentResults` insert rejected (policy 400) in live test; `assessments` and `student_answers` contain 0 rows. **Core-loop scoring step currently fails.**
- [implemented] **ASSESS-05**: Offline assessment queue + sync on reconnect — `offlineAgent.ts` (localStorage), `syncAgent.ts` (`online` listener); synced data still blocked by ASSESS-04
- [implemented] **ASSESS-06**: Offline answers queue survives refresh — localStorage key `echolearn_offline_assessments`, guarded `JSON.parse`

### Learning Gaps & Path

- [partial] **GAPS-01**: Surface learning gaps to the student — `Gaps.tsx` queries `student_mastery`/`concept_dependencies` inline; tables empty → renders empty state. `LearningGap` type re-declared locally (drift)
- [partial] **GAPS-02**: Dependency-aware learning path — `LearningPath.tsx` renders a path but from mocks (`useLearningMap`); `concept_dependencies` table empty
- [implemented] **GAPS-03**: Gap-based study recommendations — `adaptiveEngine` link drive; surfaced through Gaps/Path UI

### AI Tutor (Online — Gemini)

- [implemented] **TUTOR-01**: Chat with an AI tutor — Edge Function `ai-tutor` proxies `gemini-3.6-flash:generateContent` with history trim (last 8); runtime unverified 🔒 (function env/`GEMINI_API_KEY` not confirmed)
- [implemented] **TUTOR-02**: AI failures degrade gracefully — client try/catch → fallback paths in `TopicLearning.tsx`
- [partial] **TUTOR-03**: "Teach Back" self-evaluation — `TeachBack.tsx` invokes `ai-tutor` with an evaluation prompt; depends on Gemini runtime 🔒
- [implemented] **TUTOR-04**: Conversation history unwinding/trimming guard — Edge Function rejects empty message (400), trims roles

### Offline AI (WebLLM)

- [implemented] **OFFLINE-01**: In-browser tutor boots and restores from model cache — `offlineAI.ts` singleton + `echolearn_offline_ai_prepared` marker; WebGPU path not exercised 🔒
- [implemented] **OFFLINE-02**: Retrieval context over curriculum knowledge base — `retrievalEngine.ts` keyword scoring → top-k chunks into system prompt
- [partial] **OFFLINE-03**: Single canonical WebLLM wrapper — ⚠ 3 near-identical copies (`offlineAI.ts` used; `localAI.ts`, `offlineTutor.ts` unused); model file would need 3× maintenance
- [partial] **OFFLINE-04**: Offline path offered with online fallback — `TopicLearning.tsx` fallback at `:530`; other pages have no offline path

### Dashboard & Progress

- [mock-only] **DASH-01**: Learning-health summary — `LearningHealthCard.tsx` (inline Supabase read of empty `student_mastery`)
- [mock-only] **DASH-02**: Topic progress grid — `TopicProgressGrid.tsx` (inline read of empty tables)
- [mock-only] **DASH-03**: Mastery trend chart — `Progress.tsx` / `useMasteryTrend` mock (recharts)
- [mock-only] **DASH-04**: Weekly study activity — `useWeeklyStudy` mock
- [mock-only] **DASH-05**: AI discoveries panel — `AIDiscoveryHero.tsx` (inline read of empty tables)
- [partial] **DASH-06**: Echo points / streaks / activities — types + mocks exist; no persistence
- [implemented] **DASH-07**: Dashboard shell, sidebar, routing — `AppLayout.tsx`, `TopBar.tsx`, framer-motion page variants

### Parent Updates

- [partial] **PARENT-01**: Parent-student linking — `parent_student_links` table referenced, empty; no working link flow verified
- [partial] **PARENT-02**: Parent update feed — `ParentUpdates.tsx` inline Supabase reads on empty tables; local re-declared `ParentUpdate` type (drift)
- [unverified] **PARENT-03**: Parent-facing updates reach a linked parent — no live account pairing test possible 🔒

### Data & Persistence Layer

- [partial] **DATA-01**: Single typed data-access seam — `useMockData.ts` documents the swap seam, but ~7 call sites read Supabase inline, bypassing hooks
- [missing] **DATA-02**: DB schema versioned in repo — ✗ no `supabase/migrations/`; schema exists only in the cloud (unreviewable)
- [missing] **DATA-03**: Dev/seed data for local development — tables are empty; app cannot be exercised against real data
- [partial] **DATA-04**: Centralized domain types — `src/types/index.ts` central, but `Gaps.tsx`/`ParentUpdates.tsx` re-declare overlapping types
- [implemented] **DATA-05**: Environment configuration — `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` validated at client construction; `.env.example` present

### Security & Operations

- [broken] **SEC-01**: Secrets stay out of version control ✗ — **`.env` (real credentials) is tracked in git**, alongside `.env.example`; `.gitignore` claims otherwise but does not match
- [partial] **SEC-02**: Row-level security on data tables — no insert policy exists (policy-denied error is the only observed RLS signal); no migration shows a policy set
- [implemented] **SEC-03**: Edge Function authenticates callers — in-function `supabase.auth.getUser()`; gateway `verify_jwt=false` + CORS `*` is a documented tradeoff
- [implemented] **OPS-01**: Project builds and lints — `npm run build` and `npm run lint` both pass on `37a3447`-era tree (post-rebrand files pending re-check)
- [missing] **OPS-02**: Automated tests — no test runner, no test files
- [missing] **OPS-03**: CI pipeline — no `.github/` or CI config
- [missing] **OPS-04**: Error monitoring — console-only logging
- [missing] **OPS-05**: Node version pin — no `.nvmrc`/`.node-version` (runs on observed Node 24)
- [partial] **OPS-06**: No dead/degenerate code — ⚠ `TopicLearning.backup.tsx` committed; duplicated WebLLM wrappers; duplicated question content

## v2 Requirements

None. Deliberately empty — the owner has not selected post-baseline direction. Candidate gaps are listed (not committed) in ROADMAP.md.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Monetization / business features | No declared business model in repo |
| New product surfaces | Owner ruled out new functionality for this baseline |
| Social / multi-tenant features | No evidence of intent; would require shared schema decisions |
| Server-rendering / backend app server | Architecture is intentionally SPA + Supabase Edg

## Traceability

**No committed phases.** Every requirement currently maps to *Deferred* — the
roadmap is a candidate backlog until the owner reviews this baseline.

**Coverage:**
- v1 requirements inventoried: 43
- Committed to a phase: 0 (roadmap deferred)
- Uncommitted but inventoried: 43

---

*Requirements baseline: 2026-09-19 (evidence-based; audit + code map).*