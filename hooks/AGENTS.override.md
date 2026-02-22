# Module Rules (hooks)

This directory is part of UI/State-facing hooks.

## Dependency Rules

- Hooks orchestrate UI/state behavior.
- Hooks must not import from `lib/storage/**` directly; use `lib/features/**`.
- Hooks should avoid direct Storage/Scheduler calls.
