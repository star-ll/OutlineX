# Module Rules (lib/storage)

This directory belongs to the Storage layer.

## Dependency Rules

- `lib/storage/**` MUST NOT depend on UI/State/Feature.

## Document-first

If you modify files under this directory, you **must** update `DESCRIPTION.md` in the same directory.

`DESCRIPTION.md` format:

- ## API (exports, params, returns, errors)
- ## Changes (date + summary + breaking changes if any)
