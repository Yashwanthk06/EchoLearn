# Coding Conventions

**Analysis Date:** 2026-09-19

## Project Context

React 19 SPA (Vite 8 + TypeScript 6) for the EchoLearn AI tutoring app. Frontend lives in `src/`, a Deno edge function lives in `supabase/functions/ai-tutor/index.ts`, and local Supabase config in `supabase/config.toml`. There is no backend framework in this repo — data access is direct Supabase client calls plus a mock-data layer.

**Linting:** `oxlint` (`npm run lint`), configured in `.oxlintrc.json` with plugins `react`, `typescript`, `oxc`. Only two custom rules: `react/rules-of-hooks: error` and `react/only-export-components: ["warn", { "allowConstantExport": true }]`.

**TypeScript config:** `tsconfig.app.json` — `target: es2023`, `moduleResolution: bundler`, `jsx: react-jsx`, `noUnusedLocals: false`, `noUnusedParameters: false`, `noFallthroughCasesInSwitch: true`. Unused locals/params are NOT errors.

**No formatter config:** No Prettier, no `.editorconfig`, no format script. Formatting is hand-maintained and inconsistent (see Formatting below).

## Naming Patterns

**Files:**
- React components: PascalCase — `Button.tsx`, `Card.tsx`, `AppLayout.tsx`
- Pages: PascalCase — `Dashboard.tsx`, `Assessment.tsx`
- Hooks: camelCase — `useMockData.ts`
- Agents/logic modules: camelCase — `syncAgent.ts`, `offlineAI.ts`
- Utility/background UI files: kebab-case with lowercase — `sign-in-card-2.tsx`, `particles-bg.tsx`, `kinetic-grid.tsx`
- There is no convention yet for test files — no tests exist.

**Components:**
- Component names: PascalCase (`Dashboard`, `ProgressRing`)
- Props interfaces: PascalCase + `Props` suffix (`ButtonProps`, `CardProps`)
- Two competing export styles coexist:
  - Function declaration: `export function Login() {...}` — `src/pages/Login.tsx`, `src/pages/Signup.tsx`, `src/pages/Gaps.tsx`, `src/components/ui/Button.tsx`
  - Const arrow with explicit type: `export const Card: React.FC<CardProps> = () => {...}` — `src/components/ui/Card.tsx`, `src/pages/Dashboard.tsx`, `src/components/layout/AppLayout.tsx`
- Named exports only for components; no default component exports except `src/App.tsx` and `src/main.tsx`.

**Functions:**
- camelCase; event handlers prefixed `handle` (`handleSubmit`, `handleMouseMove` — `src/pages/Login.tsx`)
- Async data loaders named `load<X>` (`loadGapData` — `src/pages/Gaps.tsx`)

**Variables:**
- camelCase; booleans frequently `is`-prefixed (`isLoading`, `isScrolled`, `isMobileMenuOpen`)
- State pairs follow `const [x, setX] = useState()`; error state is either `useState('')` (`src/pages/Login.tsx`) or `useState<string | null>(null)` (`src/pages/Gaps.tsx`)
- module-level mutable singletons use camelCase (`engine`, `loading`, `loadingProgress` — `src/agents/offlineAI.ts`)

**Types:**
- Domain types/interfaces: PascalCase in `src/types/index.ts` (`User`, `Topic`, `TopicProgress`)
- String-literal unions used instead of TS enums (`MasteryLevel`, `GapSeverity`, `ActivityType` — `src/types/index.ts:14,39,77`)
- No `I` prefix on interfaces. Interfaces describe data shapes; `type` used for unions and inline shapes.

## Formatting

Two formatting dialects exist and both must be treated as "accepted" until a formatter is introduced:

1. **Compact style** — used in `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx`, `src/pages/Login.tsx`, `src/pages/Dashboard.tsx`, `src/App.tsx`:
   ```tsx
   const baseClasses =
     'inline-flex items-center justify-center gap-2 rounded-[6px] font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
   ```
2. **Spread-out style** — used heavily in `src/agents/*.ts`, `src/pages/Assessment.tsx`, `src/pages/Gaps.tsx`, `src/pages/TopicLearning.tsx`, `src/components/dashboard/AIDiscoveryHero.tsx`: every argument and chained call on its own line with generous blank lines:
   ```tsx
   const {
     data: topicData,
     error: topicError,
   } = await supabase
     .from('topics')
     .select('id, name')
     .order('name');
   ```

**Universal:**
- Single quotes; semicolons at statement ends (`src/main.tsx`, `src/lib/utils.ts`). Exception: the Deno edge function `supabase/functions/ai-tutor/index.ts` uses double quotes (Deno style).
- 2-space indentation.
- Trailing commas in multi-line object/array literals.

## Import Organization

**Order:**
1. Third-party: `react`, `framer-motion`, `react-router-dom`, `lucide-react`, `@supabase/supabase-js`, charts
2. Local libs: `../lib/supabase`, `../lib/utils`
3. Contexts: `../contexts/AuthContext`
4. Components: `../components/...`
5. Pages: `../pages/...`
6. Data/types: `../data/mockData`, `../types`

**Type imports** — two mixed styles:
- Inline: `import { type ClassValue, clsx } from 'clsx'` (`src/lib/utils.ts`) and `import { type ReactNode } from 'react'` (`src/components/ui/Button.tsx`)
- Separate block: `import type { Session, User } from '@supabase/supabase-js'` (`src/contexts/AuthContext.tsx`); large multi-line `import type { ... } from '../types'` blocks in `src/data/mockData.ts:1` and `src/hooks/useMockData.ts:21`

**React import habit:** Most files start with `import React from 'react'` even with `react-jsx` transform (`src/components/ui/Card.tsx`, `src/pages/Dashboard.tsx`). `src/pages/Login.tsx` instead uses named imports only (`import { FormEvent, useState } from 'react'`) and references `React.MouseEvent` via the global namespace. Follow the file's local style when editing.

**Path Aliases:** None. All imports are relative (`../`, `../../`). No `@/` alias in `vite.config.ts` or tsconfig.

## Code Style

**Component structure:**
- Props destructured at the top of the component signature with defaults inline (`src/components/ui/Button.tsx:16`)
- Class-string lookups via `Record<string, string>` maps and template-literal joins (`Button.tsx:30`, `Card.tsx:19`) — NOT via the `cn()` helper, which exists in `src/lib/utils.ts` but is used only once (`src/components/ui/sign-in-card-2.tsx:13`). New code: prefer `cn()` for conditional classes; the Record-map pattern is fine for static variant tables.

**Styling:** Tailwind CSS v4. Design tokens are CSS custom properties in `src/index.css` `@theme` block (`--color-primary`, `--color-danger`, `--color-text-primary...`), consumed as semantic utilities (`bg-primary`, `text-text-primary`, `border-border`). Custom shadow utilities (`shadow-card`, `shadow-card-hover`) and `gradient-ai` live in `@layer utilities` in `src/index.css`. Inline `style={{...}}` is used for dynamic values (e.g., particle positions, 3D tilt in `Login.tsx`).

**Animation:** framer-motion everywhere — `motion.div`, `motion.button` with `whileHover`/`whileTap`, and reusable variants objects (`sectionVariants`, `cardVariant` in `src/pages/Dashboard.tsx:14`). AnimatePresence used for modals/dropdowns (`src/pages/Login.tsx:2`, `src/components/layout/TopBar.tsx`).

## Error Handling

**Patterns:**
- **Auth result-object pattern:** Context methods never throw; they return `{ error: Error | null }` (and `needsConfirmation` for signup). Callers check `result.error` and `setError(result.error.message)` — `src/contexts/AuthContext.tsx:66-93`, consumed in `src/pages/Login.tsx:47-53`.
- **Loader pattern (dominant for data fetching):** per-component `load<X>` async function, try/catch/finally:
  ```tsx
  const loadGapData = async () => {
    setLoading(true);
    setError(null);
    try { ... } catch (err) {
      console.error('Failed to load learning gaps:', err);
      setError(err instanceof Error ? err.message : 'Unable to load your learning gaps.');
    } finally {
      setLoading(false);
    }
  };
  ```
  — `src/pages/Gaps.tsx:185-293`. Same shape in `src/pages/ParentUpdates.tsx`, `src/components/dashboard/AIDiscoveryHero.tsx`, `src/components/dashboard/TopicProgressGrid.tsx`.
- **Supabase error wrapping:** every `.from().select()/insert()/upsert()` checks `error` and rethrows as `new Error(`Unable to load X: ${error.message}`)` with contextual prefixes (`src/pages/Gaps.tsx:217`, `src/pages/Assessment.tsx:686-710`).
- **`instanceof Error` fallback:** error message extraction always via `err instanceof Error ? err.message : <fallback>` (`src/pages/Gaps.tsx:286`, `supabase/functions/ai-tutor/index.ts:273`).
- **localStorage access wrapped** in try/catch with graceful fallbacks (`src/agents/offlineAgent.ts:15-27`, `src/agents/offlineAI.ts:17-26`).
- Guard-throw for misuse: `useAuth()` throws `'useAuth must be used inside AuthProvider'` when outside provider (`src/contexts/AuthContext.tsx:114`). Same context-defensive pattern for all contexts.

## Logging

**Framework:** `console` only. No logging library.

**Patterns:**
- `console.error('<Context>:', error)` in catch blocks — consistently two-arg with a descriptive prefix (`'Failed to load learning gaps:'`, `'Assessment save error:'`)
- `console.warn` for recoverable degradation (`src/agents/offlineAI.ts:191`)
- `console.log` for lifecycle events (`src/agents/offlineAgent.ts:69`)
- Server side (edge function): `console.error("Gemini API error:", ...)`.

## Comments

**When to Comment:**
- Section separators with `/* ========== TITLE ========== */` banners (`src/pages/Assessment.tsx:726`) or `/* ------ TITLE ------ */` (`src/pages/Gaps.tsx:205`)
- Decorative ASCII-dividers: `// ─── Title ─────...` in `src/types/index.ts` and `src/data/mockData.ts`; `/* ─── Title ──── */` in `src/pages/Dashboard.tsx:12`
- Block comments explain WHY, not WHAT — e.g. the load-order rationale in `src/contexts/AuthContext.tsx:30-55`, localStorage rationale in `src/agents/offlineAI.ts:96-99`
- `conditional`-style inline notes like `/* Not final question. */` (`src/pages/Assessment.tsx:747`)

**JSDoc/TSDoc:**
- JSDoc `/** ... */` used on exported functions in `src/agents/*.ts` (see `src/agents/syncAgent.ts:13-19`, `src/agents/offlineAI.ts:13-17`)
- NOT used in components/pages — those use plain `/* ... */` block comments
- Files explicitly tagged as integration points: "// These hooks are the integration points for Supabase." (`src/hooks/useMockData.ts:41`)

## Function Design

**Size:** No hard rule; large page files are common (`src/pages/Assessment.tsx` is ~1770 lines, `src/pages/TeachBack.tsx` ~1190). Helpers are extracted to `src/agents/` and `src/lib/utils.ts` when reusable.

**Parameters:** Small, typed parameter lists; `onProgress?: (progress: number) => void` optional callback pattern (`src/agents/offlineAI.ts:68`). Destructured props with defaults.

**Return Values:** Explicit `Promise<SyncResult>`-style return types on exported logic modules (`src/agents/syncAgent.ts:7`). Success/failure expressed as result objects (`{ success, syncedCount, failedCount }`) rather than throws where a caller must branch.

## Module Design

**Exports:** Named exports everywhere. Documented top-of-file imports. Agent modules (`src/agents/*`) export pure-ish helper functions consumable from React components. Data modules (`src/data/mockData.ts`) export typed `mockX` consts; consumed through hooks in `src/hooks/useMockData.ts`.

**Barrel Files:** None. No `index.ts` re-export aggregators in `src/components/*` — components are imported by relative path.

**Singleton pattern:** `src/lib/supabase.ts` creates and exports one `supabase` client, imported by ~12 files throughout `src/`. Module-level mutable state singletons in `src/agents/offlineAI.ts` (`engine`, `loading`) guarded by `loading` flag to prevent double init.

## Key Conventions Checklist for New Code

- Use TypeScript types from `src/types/index.ts`; add new domain types there, with `// ─── Category ───` separators
- Import the Supabase client via `import { supabase } from '<relative>/lib/supabase'` — never create a second client
- Wrap every Supabase call: check `error`, rethrow with contextual message, `console.error` in catch, `finally { setLoading(false) }`
- Data fetch inside components: `load<X>()` async fn + `useEffect(() => { loadX(); }, [])`
- Use `cn()` from `src/lib/utils.ts` for conditional Tailwind classes
- Mock data: extend `src/data/mockData.ts` + `src/hooks/useMockData.ts` (named `use<Domain>` returning typed data); these are the designated Supabase integration points
- Edge function code in `supabase/functions/ai-tutor/index.ts` follows Deno conventions (double quotes, `Deno.serve`, `Deno.env.get`, `esm.sh` imports) — do not apply React conventions there

---

*Convention analysis: 2026-09-19*