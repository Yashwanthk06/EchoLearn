# Roadmap: EchoLearn

## Overview

EchoLearn is at **baseline assessment** (2026-09-19). The owner has not selected
a post-baseline direction, so this roadmap deliberately contains **no committed
phases**. Once the requirements baseline (`REQUIREMENTS.md`) is reviewed, items
may be promoted from the Candidate Backlog below into numbered phases. Until
then, nothing here is planned work.

## Phases

None committed. Roadmap activation is the owner's decision post-review.

## Candidate Backlog (Decision Pending)

Evidence-sourced candidates from the baseline. **Not committed** — listed for
the review decision. Grouped by evidence class, roughly ordered by risk/ROI.

| # | Candidate | Baseline evidence | Class |
|---|-----------|-------------------|-------|
| B1 | Stop tracking `.env`; rotate credentials; fix `.gitignore` | SEC-01: `.env` committed to git | broken → security |
| B2 | Fix assessment persistence (insert policy 400) and add DB migrations + RLS policies | ASSESS-04, DATA-02, SEC-02 | broken → core loop |
| B3 | Fix first-login redirect (missing `/auth-callback` route) | AUTH-03 | broken |
| B4 | Unify data access through hooks + centralize types (remove ~7 inline Supabase reads) | DATA-01, DATA-04 | debt → enable everything |
| B5 | Version schema + seed data so the app runs against real rows (unblocks all 🔒 verification) | DATA-02, DATA-03 | missing → unblocks runtime checks |
| B6 | Dead-code/dedupe pass: delete `TopicLearning.backup.tsx`, merge 3 WebLLM wrappers, single question source | OPS-06, OFFLINE-03 | debt |
| B7 | Parent updates end-to-end (linking + feed + delivery) | PARENT-01..03 | partial |
| B8 | Testing + CI baseline (test runner, smoke tests, pipeline) | OPS-02, OPS-03 | missing |
| B9 | Node version pin + error monitoring | OPS-04, OPS-05 | missing → low |

**Promotion rule:** items become numbered phases only via explicit owner review
of this backlog (e.g. `gsd-phase add`) — or a fresh `gsd-new-milestone` when the
direction is set.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| (none — roadmap deferred) | - | Deferred | - |

---

*Roadmap baseline: 2026-09-19 (deferred — no committed phases).*