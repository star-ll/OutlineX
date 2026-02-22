# Module Rules (lib/features)

This directory belongs to the Feature layer.

## Feature Layer Rules

- Core business logic.
- Supplies APIs for UI or State layers using FP, OOP, etc.
- Must not directly manipulate UI components.
- May call `lib/**`.

## Document-first

If you modify files under this directory, you **must** update `DESCRIPTION.md` in the same directory.

`DESCRIPTION.md` format:

- ## API (exports, params, returns, errors)
- ## Changes (date + summary + breaking changes if any)
