# Architecture Clean Score Rubric

> Auto-generated from `AGENTS.md`.
> Source: `/Users/liangle/project/note-app/AGENTS.md`
> Generated: `2026-02-15 21:30:38`
> Source SHA-256 (12): `a0bb0ddd32cf`

Use this rubric to produce a 100-point architecture cleanliness score.

## Base Score

Start from `100`.

## Rule Penalties (Derived From AGENTS.md)

1. `-12` (Medium, Dependency Rules): UI layer -> State layer -> Feature layer -> (Storage layer, Scheduler layer) -> Algorithms layer
2. `-20` (High, Dependency Rules): UI/State MUST NOT import from `lib/storage/**` directly (use `lib/features/**`).
3. `-15` (High, Dependency Rules): `lib/algorithms/**` MUST be pure (no IO, no React Native APIs).
4. `-20` (High, Dependency Rules): `lib/storage/**` MUST NOT depend on UI/State/Feature.
5. `-10` (Medium, Code Constraint): `lib/storage/**`
6. `-10` (Medium, Code Constraint): `lib/algorithms/**`
7. `-10` (Medium, Code Constraint): `lib/features/**`
8. `-10` (Medium, Code Constraint): ## API (exports, params, returns, errors)
9. `-10` (Medium, Code Constraint): ## Changes (date + summary + breaking changes if any)

## Severity Mapping

- `High`: penalty `>= 15`
- `Medium`: penalty `8-14`
- `Low`: penalty `<= 7`

## Score Bands

- `90-100`: clean, constraints mostly enforced
- `75-89`: generally healthy, some important issues to fix
- `60-74`: noticeable architecture debt
- `<60`: architecture boundaries are weak or frequently violated

## Reporting Requirements

- Show each deduction with:
  - broken rule
  - file evidence
  - penalty points
- Show subtotal by severity.
- Show final formula:
  - `Final = max(0, 100 - total_penalty)`
  - `Current rubric max theoretical penalty = 117`

## Notes

- Re-run generator whenever `AGENTS.md` changes.
- Keep only verified violations; do not deduct for assumptions.

