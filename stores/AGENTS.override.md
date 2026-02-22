# Module Rules (stores)

This directory belongs to the State layer.

## State Layer Rules

- Based on Zustand, Context, and other patterns (such as custom in-memory trees).
- Supplies state for UI.
- May call `lib/features` (Feature layer).
- Must not directly call Scheduler or Storage.

## Dependency Rules

- State must not import from `lib/storage/**` directly; use `lib/features/**`.
