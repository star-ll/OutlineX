# Module Rules (lib/scheduler)

This directory belongs to the Scheduler layer.

## Scheduler Rules

- Task IDs must be named from `lib/scheduler/task-id`.
- `task.id` must include a name prefix, such as `storage-${id}`.

## Document-first

If you modify files under this directory, you **must** update `DESCRIPTION.md` in the same directory.

`DESCRIPTION.md` format:

- ## API (exports, params, returns, errors)
- ## Changes (date + summary + breaking changes if any)

## Test-first

When you add or generate APIs under this directory, you **must** add corresponding unit tests at the same time.
