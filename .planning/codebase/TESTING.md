# Testing Patterns

**Analysis Date:** 2026-09-19

## Test Framework

**Status: No automated tests exist in this repository.**

- No test runner installed: `package.json` devDependencies contain only `oxlint`, `supabase` CLI, `vite`, TypeScript, and Tailwind tooling. No `vitest`, `jest`, `playwright`, `cypress`, `testing-library`, or `@testing-library/react`.
- No test script in `package.json` — the scripts are `dev`, `build`, `lint`, `preview`.
- No test configuration files: no `vitest.config.*`, `jest.config.*`, `playwright.config.*`.
- No test files: glob for `**/*.{test,spec}.{ts,tsx,js,jsx}` and `**/__tests__/**` returns nothing under `src/`, `supabase/`, or the repo root.

**Current validation gates:**
```bash
npm run lint    # oxlint with react/typescript/oxc plugins (.oxlintrc.json)
npm run build   # tsc -b && vite build — type-checks src/ and bundles
```

These are the only automated quality checks. `tsc -b` type-checking is the de-facto correctness gate for new code.

## Recommended Test Runner (for when tests are added)

If a phase introduces tests, use **Vitest** — it is the natural fit for a Vite 8 project (zero config, same transform pipeline, `vi.mock` for the Supabase client):

```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `package.json`:
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

The existing agent modules and mock-data hooks are pure-enough to unit test without a DOM environment; component tests would need `jsdom` + `@testing-library/react`.

## What to Mock (when testing)

**The Supabase client must always be mocked.** `src/lib/supabase.ts` exports a singleton created from `import.meta.env` vars and throws at import time if env vars are missing — any test importing a component that imports Supabase (`src/pages/Gaps.tsx`, `src/pages/Assessment.tsx`, `src/components/dashboard/AIDiscoveryHero.tsx`, etc.) must mock `../lib/supabase` first:

```ts
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }) },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));
```

**framer-motion** (`motion.*` components) renders fine under jsdom for basic assertions but can be replaced with plain elements if animation timing interferes; no mocking library is currently configured.

**Do NOT mock** the pure logic in `src/agents/` (below) — those are the testable units.

## High-Value Test Targets (existing pure logic)

These modules contain extractable, currently-tested-by-nothing logic that unit tests would cover cheaply:

- `src/agents/offlineAgent.ts` — localStorage-backed CRUD for offline assessments: `saveOfflineAssessment`, `getOfflineAssessments`, `markAssessmentAsSynced`, `clearOfflineAssessment` (lines 50-134). Testable under jsdom/happy-dom; `crypto.randomUUID()` needs a polyfill in some jsdom versions.
- `src/agents/syncAgent.ts` — `syncPendingAssessments` (lines 35-83) loops over pending items, counts success/failure; `onConnectionRestored` (lines 91-109) is a pure listener add/remove pair. `navigator.onLine` needs stubbing.
- `src/agents/offlineAI.ts` — state machine around engine init (`initializeOfflineAI`, `restoreOfflineAI`, `prepareOfflineAI`) with module-level `engine`/`loading` flags; WebLLM calls (`webllm.CreateMLCEngine`) must be stubbed.
- `src/agents/adaptiveEngine.ts` / `adaptiveQuestionAgent.ts` / `questionBank.ts` — scoring/selection logic.
- `src/agents/retrievalEngine.ts` — `buildKnowledgeContext(question, 4)` used by `offlineAI.ts`.
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge).
- `src/hooks/useMockData.ts` — pure wrappers over `src/data/mockData.ts` consts; trivial but a good smoke test for type stability of the mock layer.

## Fixtures and Factories

**Existing data fixtures (single source of truth):**
- `src/data/mockData.ts` (~960 lines) — typed mock objects for every domain type: `mockUser`, `mockTopics`, `mockTopicProgress`, `mockLearningGaps`, `mockActivities`, etc. Any test needing domain data should import from here instead of hand-writing fixtures.
- `src/data/mlKnowledgeBase.ts` — curriculum content, used by `retrievalEngine.ts`.

**Factory helpers:** none exist. If tests need variable shapes, extend `src/data/mockData.ts` with a `make<Domain>(overrides?)` factory following the existing export naming.

## Test Types

**Unit Tests:** None currently. The natural first batch targets the `src/agents/*.ts` modules listed above.

**Integration Tests:** None. The Supabase schema lives in `supabase/` (local config `supabase/config.toml`, edge function `supabase/functions/ai-tutor/`). No integration harness exists.

**E2E Tests:** None. No Playwright/Cypress.

## Coverage

**Requirements:** None enforced. No coverage tooling installed. When Vitest is added, `vitest run --coverage` requires the `@vitest/coverage-v8` package.

## Common Pitfalls When Adding Tests to This Codebase

1. `src/lib/supabase.ts` throws at import if `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` missing → always `vi.mock` it in component tests (see pattern above).
2. Components read `localStorage` (`src/agents/offlineAgent.ts:13` uses `STORAGE_KEY`) — tests must clear storage between tests (`localStorage.clear()` in `beforeEach`); the agent code swallows localStorage errors, so failures surface as empty arrays, which can mask test setup bugs.
3. Module-level singletons in `src/agents/offlineAI.ts` (`engine`, `loading`) persist across tests in the same file — use `vi.resetModules()` + dynamic `import()` to reset state between tests.
4. `navigator.onLine` (`src/agents/syncAgent.ts:18`, `offlineAgent.ts:44`) is read directly; stub via `Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })`.
5. Large page components (`src/pages/Assessment.tsx`, `src/pages/TeachBack.tsx`, `src/pages/TopicLearning.tsx` are 1000+ lines each) are tightly coupled to Supabase + framer-motion + mock data; prefer testing extracted logic (agents/hooks) over full-page renders until components are refactored for testability.

---

*Testing analysis: 2026-09-19*