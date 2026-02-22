# Module Rules (lib/algorithms)

This directory belongs to the Algorithms layer.

## Dependency Rules

- `lib/algorithms/**` MUST be pure (no IO, no React Native APIs).

## Document-first

If you modify files under this directory, you **must** update `DESCRIPTION.md` in the same directory.

`DESCRIPTION.md` format:

- ## API (exports, params, returns, errors)
- ## Changes (date + summary + breaking changes if any)

## Test-first

When you add or generate APIs under this directory, you **must** add corresponding unit tests at the same time.
