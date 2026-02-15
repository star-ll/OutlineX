---
name: check-architecture-clean-score
description: Check architecture cleanliness against project constraints and output a 100-point score with actionable fixes. Use when asked to audit codebase architecture quality, validate dependency-direction rules, verify folder-level boundaries, or evaluate compliance with AGENTS.md architecture and coding constraints.
---

# Check Architecture Clean Score

Audit architecture cleanliness by reading project constraints and checking implementation compliance.

## Workflow

1. Read architecture and constraints from `AGENTS.md` in the current workspace.
2. Regenerate rubric from latest `AGENTS.md`:
   - Run:
     - `python3 skills/check-architecture-clean-score/scripts/generate_score_rubric.py --agents AGENTS.md --out skills/check-architecture-clean-score/references/score-rubric.md`
   - If generation fails, continue with existing `references/score-rubric.md` and state this in assumptions.
3. Build a checklist from explicit rules, especially:
   - Layer dependency direction
   - Forbidden imports and coupling
   - Folder responsibilities
   - Required documentation updates (`DESCRIPTION.md`) for constrained paths
4. Scan the codebase to find compliance and violations:
   - Prefer fast file discovery (`rg --files`) and pattern checks (`rg`)
   - Open suspicious files to confirm real behavior before reporting
5. Score architecture cleanliness out of 100 using the rubric in `references/score-rubric.md`.
6. Report:
   - Final score
   - Findings grouped by severity
   - File-level evidence
   - Concrete fixes ordered by impact

## Scoring Rules

Load `references/score-rubric.md` before scoring.

Apply penalties only for verified violations. Do not penalize assumptions.
If AGENTS.md has no rule for an area, treat it as informational only.

## Output Format

Use this response structure:

1. `Clean Score: <number>/100`
2. `Summary`: 2-4 lines
3. `Violations`:
   - `High`: rule breaks that can cause architecture drift or broken boundaries
   - `Medium`: meaningful design debt that weakens maintainability
   - `Low`: style/process consistency gaps
4. `Suggested Fixes`:
   - prioritized, specific, and linked to files/rules
5. `Assumptions or Unknowns`:
   - list anything not verifiable from repository contents

## Guardrails

- Read constraints first; never score before reading `AGENTS.md`.
- Cite file paths for every violation.
- Keep suggestions minimally invasive and aligned with current architecture.
- If no violation is found, still provide score rationale and residual risks.
