# Codebase Concerns

**Analysis Date:** 2026-09-19

## Tech Debt

**Mock-data layer masquerading as a live app:**
- Issue: `src/hooks/useMockData.ts` returns hardcoded demo data (`mockUser`, `mockTopics`, `mockEchoPoints`, etc. from `src/data/mockData.ts`) with a comment: "Replace the mock data returns with Supabase queries later." Many screens permanently render this fake data for every logged-in user, while other screens query the real database — users see canned content next to real content with no distinction.
- Files: `src/hooks/useMockData.ts`, `src/data/mockData.ts` (944 lines), consumed by `src/pages/Dashboard.tsx`, `src/components/dashboard/EchoPointsCard.tsx`, `src/components/dashboard/RecentActivity.tsx`, `src/pages/Progress.tsx`, `src/pages/Learn.tsx`, `src/pages/LearningPath.tsx`, `src/components/dashboard/LearningMap.tsx` (line 6).
- Impact: Confusing product (fake data presented as real), impossible to verify features against real data, effort duplicated — several components (e.g. `LearningHealthCard.tsx`) already reimplement live queries that another screen shows as mock.
- Fix approach: Delete `useMockData.ts` consumers one screen at a time and back the hooks with `supabase` queries. The hooks file is the single integration point — replace its bodies, keep signatures.

**Triplicated offline-AI stack (web-llm):**
- Issue: Three separate modules each wrap `@mlc-ai/web-llm` with their own module-level `engine` singleton, each exporting an `askOfflineAI` helper using the same model id (`Llama-3.2-1B-Instruct-q4f16_1-MLC`), with diverged behavior: `offlineAI.ts` throws when a second init races ("already being initialized"), `offlineTutor.ts` returns `null`, `localAI.ts` coalesces via a `loadingPromise`.
- Files: `src/agents/offlineAI.ts` (used by `src/pages/TopicLearning.tsx` line 45), `src/agents/offlineTutor.ts` (NO importers — dead), `src/agents/localAI.ts` (NO importers — dead).
- Impact: Dead code confusion; ~1GB+ browser memory if two engines ever load; the used module (`offlineAI.ts`) has a concurrency race on first-ever load.
- Fix approach: Delete `offlineTutor.ts` and `localAI.ts`; fix `offlineAI.ts` to coalesce concurrent `initializeOfflineAI` calls with a shared `loadingPromise` like `localAI.ts` did.

**Committed dead code and template leftovers:**
- `src/pages/TopicLearning.backup.tsx` (548 lines) — a committed backup of the live `TopicLearning.tsx`; still imports `supabase`, calls `ai-tutor`.
- `src/pages/Landing.tsx` (519 lines) — fully built landing page but NOT routed: `src/App.tsx` only registers `/login`, `/signup`, protected app routes, and `path="*"` → `/` (which redirects to `/login` when logged out). The landing page is unreachable.
- `src/components/ui/sign-in-card-2.tsx` (483 lines, no importers), `src/components/ui/kinetic-grid.tsx` (216 lines, no importers), `src/components/shared/ActivityItem.tsx`, `src/components/shared/AIInsightCard.tsx`, `src/components/shared/TopicMasteryCard.tsx` (all no importers).
- `src/assets/vite.svg` and the default Vite template `README.md` text remain.
- Fix approach: Delete unreferenced files (or route `Landing.tsx` if intended as the public home); replace README.

**No database migrations in repo:**
- Issue: There is no `supabase/migrations/` directory. All tables (`topics`, `questions`, `student_mastery`, `student_answers`, `assessments`, `concept_dependencies`) exist only in the remote Supabase project. RLS policies are not version-controlled.
- Files: code referencing tables — `src/pages/Gaps.tsx` (lines 209-262), `src/pages/Assessment.tsx` (lines 372-565), `src/components/dashboard/LearningHealthCard.tsx` (lines 53-58), `src/components/dashboard/AIDiscoveryHero.tsx`, `src/components/dashboard/ParentUpdateStatus.tsx`, `src/components/dashboard/TopicProgressGrid.tsx`.
- Impact: Any schema/policy change is invisible to review; new environments cannot be provisioned; schema-drift breaks the app silently.
- Fix approach: Capture the current schema via `supabase db pull` and start committing migrations + RLS policies.

**God components:**
- Issue: Single files mix data loading, DB I/O, AI orchestration, animation, and rendering.
- Files: `src/pages/Assessment.tsx` (1542 lines), `src/pages/TeachBack.tsx` (1190 lines, includes bespoke speech-recognition plumbing), `src/pages/TopicLearning.tsx` (1049 lines, online→offline→error AI fallback chain), `src/pages/Gaps.tsx` (710 lines), `src/components/dashboard/AIDiscoveryHero.tsx` (671 lines).
- Impact: Hard to test, high merge-conflict surface, logic can't be reused (e.g. the `ai-tutor` invoke is duplicated between `TopicLearning.tsx` and `TeachBack.tsx`).
- Fix approach: Extract AI-invoke, speech recognition, and data-loading into hooks/`src/agents/` modules.

**Faked timestamps & stale validations:**
- `src/pages/Assessment.tsx` line 414-416: `startedAt` is fabricated as `Date.now() - 5 * 60 * 1000` — no real start-time tracking exists.
- `tsconfig.app.json` sets `noUnusedLocals: false` and `noUnusedParameters: false` and README-recommended type-aware linting (`oxlint-tsgolint`) is not installed; `.oxlintrc.json` enforces only 2 rules. Dead code compiles silently.

## Known Bugs

**Assessment answers silently dropped on question-text mismatch:**
- Symptoms: `src/pages/Assessment.tsx` matches client quiz questions against the DB `questions` table by comparing `question_text === question.question` (lines 504-513); non-matching questions are filtered out and never saved (line 548-553). The user believes all answers were recorded.
- Files: `src/pages/Assessment.tsx`, `src/agents/questionBank.ts`, DB `questions` table.
- Trigger: Any quiz question text that differs from the DB copy (bank edited, DB seeded differently).
- Workaround: Keep `questionBank.ts` text identical to DB rows; no runtime warning is emitted when rows are dropped.

**Whole assessment save aborts on any missing topic:**
- `src/pages/Assessment.tsx` lines 390-400: if any client topic name has no matching `topics` row, the entire save throws — user loses the completed assessment despite answering everything.
- Fix: upsert topics or skip-with-warning instead of failing the whole transaction.

**Destructive `student_answers` write pattern:**
- `src/pages/Assessment.tsx` lines 478-489 deletes every existing `student_answers` row for the assessment before re-inserting. A refresh/crash between DELETE and INSERT permanently loses previous answers.
- Fix: upsert by `(assessment_id, question_id)` instead of delete-then-insert.

**Offline AI init race:**
- `src/agents/offlineAI.ts` lines 76-80: a second `initializeOfflineAI()` while a download is in progress throws instead of returning the in-flight promise. Symptom: intermittent "already being initialized" on `TopicLearning.tsx` mount when the model is still loading.
- Trigger: Two `TopicLearning` mounts or a user action during the (potentially minutes-long) model download.

**Mock list + real write inconsistency (Assessment page):**
- `src/pages/Assessment.tsx` line 218 lists assessments from `useAssessments()` (mock), but the assessment taken is generated client-side from `questionBank.ts` and saved to the real DB — the history shown never reflects what the user actually took.

## Security Considerations

**`.env` is committed to git:**
- Risk: `git ls-files` shows `.env` is tracked, despite `.gitignore` line 9 listing it. If the committed values are real (Supabase URL + anon key), they are exposed in history and to anyone with repo access. The anon key is meant to be public-ish and RLS is the real gate, but a committed `.env` is still a hygiene failure and any *other* var added there later will leak.
- Files: `.env` (tracked).
- Current mitigation: `.gitignore` lists `.env` (ineffective for already-tracked files).
- Recommendations: `git rm --cached .env` and commit. If the committed key ever was a real project key, rotate it in Supabase.

**Supabase CLI temp files committed:**
- Risk: `supabase/.temp/` (8 files: `linked-project.json`, `project-ref`, `pooler-url`, version files) is tracked in git. `pooler-url` contains a `postgresql://...` connection URL (project ref is committed in `linked-project.json`). These are machine-state files, regenerated on every `supabase link`.
- Files: `supabase/.temp/*`, `supabase/functions/ai-tutor/.npmrc` (also committed).
- Recommendations: Add `supabase/.temp/` to `.gitignore` and `git rm -r --cached supabase/.temp`.

**Edge function abuse / cost exposure:**
- Risk: `supabase/functions/ai-tutor/index.ts` has no rate limiting, no per-user quota, no message-length cap, and `corsHeaders` sets `Access-Control-Allow-Origin: *` (line 4). Any authenticated user (or stolen JWT) can hammer the function; every call bills Gemini API. The platform config disables JWT verification at the gateway.
- Files: `supabase/functions/ai-tutor/index.ts`, `supabase/config.toml` (`verify_jwt = false`).
- Current mitigation: function verifies the caller via `supabase.auth.getUser()` (lines 67-86); `GEMINI_API_KEY` lives server-side only.
- Recommendations: enable `verify_jwt = true`, add rate limiting (e.g. per-user counter in a table or `x-ratelimit` via a middleware), cap `message` length, add a fetch timeout to Gemini.
- Note: RLS policies themselves live only in the remote project (see Tech Debt: no migrations) — they cannot be audited from this repo. All client DB reads/writes (e.g. `Assessment.tsx`) depend on them.

**Server error leakage:**
- `supabase/functions/ai-tutor/index.ts` lines 268-285 returns `error.message` from the catch block to the client; Gemini error details are forwarded (lines 209-211). Minor info disclosure.

**Prompt injection surface:**
- The client controls `history` and `message` which are concatenated into the Gemini request with the system prompt in a single `system_instruction`/contents split (`index.ts` lines 149-170). No delimiters isolate the system prompt from student content. Acceptable for an education app, but a hostile prompt could redirect the tutor. Consider marking the injected topic/message section explicitly as untrusted student input.

## Performance Bottlenecks

**web-llm statically bundled:**
- Problem: `src/pages/TopicLearning.tsx` statically imports `src/agents/offlineAI.ts` (line 45), which statically imports `@mlc-ai/web-llm` (line 1). The full web-llm JS/wasm runtime is part of the main bundle and initialized on app start paths even for users who never use offline AI.
- Files: `src/agents/offlineAI.ts`, `src/pages/TopicLearning.tsx`.
- Cause: static import chain; `@mlc-ai/web-llm` is a large runtime (~MBs of JS + wasm). The ~1GB model itself is only downloaded on demand (good), but the library cost is up-front.
- Improvement path: dynamic `import('../agents/offlineAI')` inside the tutor send handler so web-llm loads only when the offline path is first used.

**Always-on canvas animations:**
- Problem: `particles-bg.tsx` renders a full-screen rAF-animated canvas on `AppLayout` (every app screen via `src/components/layout/AppLayout.tsx` line 5) and on `Login.tsx` (line 6). Combined with framer-motion animations throughout, low-end devices (the README/`localAI.ts` targets Iris Xe + 16GB laptops) will churn.
- Files: `src/components/ui/particles-bg.tsx` (254 lines), `src/components/layout/AppLayout.tsx`, `src/pages/Login.tsx`.
- Improvement path: pause rAF when the tab is hidden / on `prefers-reduced-motion`, or swap to a static gradient on app screens.

**Unbounded localStorage queue:**
- `src/agents/offlineAgent.ts` stores every offline assessment in one localStorage key (`echolearn_offline_assessments`, line 13) with full answers; no cap. localStorage ~5MB quota. Sync runs per-item in a loop (`src/agents/syncAgent.ts` lines 53-76) with no dedupe/conflict resolution.
- Files: `src/agents/offlineAgent.ts`, `src/agents/syncAgent.ts`.

## Fragile Areas

**Client question bank ↔ DB sync (see Known Bugs):** `src/agents/questionBank.ts` must stay textually identical to the DB `questions` and `topics` tables. Any drift breaks saves.

**Delete-then-insert mastery/answers writes:** `Assessment.tsx` lines 478-489 and the mastery update loop (lines 577+) — a crash mid-save leaves partial data; the flow is not idempotent.

**Speech recognition in TeachBack:** `src/pages/TeachBack.tsx` lines 48-102 hand-declares ~8 structural interfaces for the Web Speech API (`SpeakerRecognitionLike` etc.) with only webkit prefixes (`window.webkitSpeechRecognition`, line 300-301); no fallback for Firefox/Safari-standard `SpeechRecognition`, no error surfacing beyond console.

**Concurrency of the offline engine singleton:** module-level `engine` in `offlineAI.ts` survives page navigation but is lost on refresh; restore path relies on a localStorage marker that can lie (marker set, cache evicted) — handled, but with a full re-download surprise when it happens.

**AI response contract coupling:** `TeachBack.tsx` (lines 785-806) asks Gemini to return "ONLY valid JSON" with a specific schema and parses it; a model change or prompt tweak silently breaks parsing. `TopicLearning.tsx` and `TeachBack.tsx` each build their own prompt for `ai-tutor` against the same generic edge function — the function has no awareness of which prompt style is being used.

## Scaling Limits

- **Offline model size:** fixed `Llama-3.2-1B-Instruct-q4f16_1-MLC` (~1GB download, ~1-2GB RAM at runtime) — hardcoded in `offlineAI.ts` line 8 (and the two dead clones). No model selection, no device-tier detection.
- **localStorage queue:** soft cap of ~5MB for offline assessments + gaps; no eviction policy (`offlineAgent.ts`).
- **Assessment data volume:** the Assessment page re-fetches the whole `questions` table (`Assessment.tsx` lines 491-497) — fine at 20 questions, not at scale.
- **No pagination anywhere:** all DB reads are full-table selects (`Gaps.tsx`, `LearningHealthCard.tsx`, `ParentUpdates.tsx`).

## Dependencies at Risk

**`@mlc-ai/web-llm` ^0.2.85:**
- Risk: bundled eagerly (see Performance); three divergent wrappers; model id pinned to a specific MLC build — a library major bump can invalidate the cached model and break `restoreOfflineAI`.
- Impact: offline AI feature (whole point of the app's "EchoLearn" offline promise).
- Migration plan: keep a single wrapper (`offlineAI.ts`), pin the model config separately from the library version, and gate loading behind a dynamic import.

**`supabase` CLI v2.117 / edge runtime:** `supabase/.temp/` committed (see Security). `verify_jwt = false` in `supabase/config.toml` should be flipped to `true` once the function's own auth check is confirmed equivalent.

## Missing Critical Features

- **No tests:** zero test files, no test runner, no `test` script in `package.json`. Only `lint` (oxlint) exists. Regression risk is high given the mock/DB hybrid and AI response parsing.
- **No CI:** no `.github/workflows`, no build/lint gate before merge. `tsc -b && vite build` never runs outside local dev.
- **No real start-time tracking** for assessments (`Assessment.tsx` fabricates `startedAt`).
- **No offline sync UI trigger audit:** `syncAgent.ts` waits for `online` event; nothing in the UI exposes unsynced counts beyond a console log in `offlineAgent.ts` line 69.
- **No error boundary** in `src/App.tsx` — a render crash blows away the whole shell.
- **No landing route:** `Landing.tsx` built but unrouted (see Tech Debt).

## Test Coverage Gaps

- **Entire app untested:** no test files exist (`src/**/*.test.*` / `*.spec.*` — none). Priority: High.
- **What's most exposed:**
  - `src/pages/Assessment.tsx` save pipeline (topic lookup → assessment upsert → delete/insert answers → mastery update) — the delete-then-insert and silent-drop bugs are exactly what tests would catch. Priority: High.
  - `src/agents/adaptiveEngine.ts` / `adaptiveQuestionAgent.ts` difficulty stepping and question selection — pure logic, trivially testable, currently untested.
  - `src/agents/offlineAgent.ts` / `syncAgent.ts` localStorage queue/sync semantics.
  - `supabase/functions/ai-tutor/index.ts` auth gating and error mapping (would need a Deno test harness).
- Risk: the mock↔DB hybrid means the same code paths behave differently in dev (mock) vs prod (empty DB), so untested regressions surface only in production.

---

*Concerns audit: 2026-09-19*