# Module Rules (lib)

`lib` contains Feature/Storage/Scheduler/Algorithms layers.

## Layer Ownership

- `lib/features/**`: Feature layer.
- `lib/storage/**`: Storage layer.
- `lib/scheduler/**`: Scheduler layer.
- `lib/algorithms/**`: Algorithms layer.

## Dependency Baseline

- Architecture flow: UI -> State -> Feature -> (Storage, Scheduler, etc.) -> Algorithms.
- UI/State must not import `lib/storage/**` directly; use `lib/features/**`.
- `lib/storage/**` must not depend on UI/State/Feature.
- `lib/algorithms/**` must remain pure (no IO, no React Native APIs).

Refer to each subdirectory `AGENTS.override.md` for detailed rules.
