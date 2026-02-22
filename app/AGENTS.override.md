# Module Rules (app)

This directory belongs to the UI layer.

## Dependency Rules

- UI must consume State/Feature APIs and must not implement Storage/Scheduler logic directly.
- UI must not import from `lib/storage/**` directly; use `lib/features/**`.
