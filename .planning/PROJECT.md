# PROJECT: EchoLearn

**Bootstrap:** 2026-09-19 (evidence-based baseline, no external docs)

> **Baseline mode.** This project has no product documentation. Everything here is
> recovered from the code and a live-environment audit, not from stated intent.
> Inferred claims are marked "(inferred)". No product direction is asserted by
> this document.

## What This Is

**EchoLearn** is a client-rendered React 19 + Vite + TypeScript single-page
application for adaptive machine-learning tutoring. The client code builds clean
(`tsc -b && vite build`) and is close to a functional prototype, but the
environment behind it is not.

- **Two AI tutor paths.** Online: a Supabase Edge Function (`ai-tutor`) proxying
  Google Gemini (`gemini-3.6-flash`). Offline: an in-browser WebLLM
  (`Llama-3.2-1B-Instruct`) with a dependency-free retrieval engine over a local
  curriculum knowledge base.
- **Auth.** Supabase email/password via `src/contexts/AuthContext.tsx`; protected
  routes gate most pages.
- **Data.** Split-backed. Most domain data flows from a mock layer
  (`src/data/mockData.ts` → `src/hooks/useMockData.ts`, the documented seam for a
  future Supabase data layer). Several pages query Supabase directly in the
  component body. The Supabase **tables are empty**, and the DB schema is **not
  versioned in this repo** (no `supabase/migrations/`).
- **Primary learning loop (inferred).** Learn topics → take a diagnostic
  assessment → surface Learning Gaps (missing prerequisites) → remedy via Teach
  Back / tutor chat → reassess. `concept_dependencies`, `student_mastery`, and
  the adaptive engine encode this as code.
- **Secondary surfaces (inferred).** Dashboard (learning health, topic progress,
  learning map, echo points), Progress trends, Parent updates.

## Core Value

From the code, the single most important thing EchoLearn does ***(inferred)***:

> Trace a student's mistakes back to missing prerequisite concepts and adapt
> their next study step to close those gaps.

Assessment, gap detection, the adaptive difficulty ladder, Teach Back
evaluation, and the learning-path/map UI all serve this loop. Everything else
(echo points, streaks, parent updates) is peripheral.

## Requirements

Baseline classification used to inventory current state (full catalog in
`REQUIREMENTS.md`):

| Class | Meaning |
|-------|---------|
| **implemented** | Code present, wired end-to-end, build-clean (static evidence) |
| **partial** | Wiring present but a segment is incomplete or blocked |
| **mock-only** | UI rendered from mock constants; no DB backing; Supabase table empty |
| **broken** | Code present but fails in the current environment |
| **missing** | Referenced or intended, but absent from the repo |
| **unverified** | Requires a configured Supabase/WebGPU runtime to confirm |

Headline findings (verified against the live environment, 2026-09-19):

- ✅ Client build passes; `npm run lint` passes (only the committed-backup rule pending discussion).
- ⚠️ `assessments` / `student_answers` result save is broken (policy 400) — the core loop's scoring step currently fails.
- ⚠️ First-time login redirect is broken (auth-callback route missing) — verified by code trace audit.
- ⚠️ Big portions render **mock-only**: Dashboard, Learn, LearningPath, Progress, ParentUpdates read mock data while their Supabase tables are empty.
- ⚠️ **`.env` with real `VITE_SUPABASE_*` credentials is tracked in git** — credentials leak.
- ⚠️ No tests exist; no CI; no Supabase migrations; no SSR/backend beyond the Edge Function.
- ⏳ Auth sessions, Gemini tutor replies, offline AI, and RLS are **unverified** (no configured Supabase with data; WebGPU offline path not exercised).

## Business Context

Not declared in the repo exists no monetization or growth evidence. The landing
page makes marketing claims ("join thousands of students") with no supporting
product data. **Omitted from this baseline by choice** — nothing evidence-based
to record.

## Out of Scope (for this baseline)

| Item | Reason |
|------|--------|
| New functionality, features, or product direction | Project is at baseline assessment; roadmap is explicitly deferred to post-review decisions |
| Runtime verification against cloud Supabase | Requires configured credentials/WebGPU; deliberately left as `unverified` |
| Committed roadmap or phase plan | Deferred by owner until baseline review |
| Business/model claims | No evidence in repo |

---

*Bootstrap complete: 2026-09-19 (evidence-based baseline, code map + audits).*