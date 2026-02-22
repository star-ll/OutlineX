# Module Rules (components)

This directory belongs to the UI layer.

## Dependency Rules

- Keep components presentation-focused.
- Components must not import from `lib/storage/**` directly; use `lib/features/**`.
- Components should avoid direct Storage/Scheduler access.
