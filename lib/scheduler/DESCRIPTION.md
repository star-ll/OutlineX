## API (exports, params, returns, errors)

### `Priority`
- Exports:
  - `Sync`
  - `Input`
  - `Default`
  - `NextFrame`
  - `Idle`

### `Scheduler`
- Constructor:
  - `new Scheduler()`
- Methods:
  - `hasTaskById(id: SchedulerId): boolean`
  - `cancel(id: SchedulerId): void`
  - `push(task): void`
    - `task.id: SchedulerId`
    - `task.priority?: Priority` (default `Priority.Default`)
    - `task.delayMs?: number` (default `0`)
    - `task.callback: (...args: any[]) => unknown`
- Behavior:
  - Uses min-heaps for delayed queue and runnable queue.
  - Same `id` pushes replace previous pending task data (dedupe with latest-task wins).
  - Flush loop uses time-slicing and yields via macro-task scheduling.
  - Promise-like callback rejections are caught and logged.
- Errors:
  - Internal callback/flush errors are caught and logged.

### `getNow()`
- Params: none
- Returns: `number` timestamp from `globalThis.performance.now()` if available, otherwise `Date.now()`.
- Errors:
  - No explicit thrown errors.

### `getStorageSchedulerId(id: string)`
- File: `task-id.ts`
- Params:
  - `id`: string suffix
- Returns:
  - Branded `SchedulerId` in format `storage-${id}`
- Errors:
  - No explicit thrown errors.

## Changes (date + summary + breaking changes if any)

- 2026-02-16: Added scheduler module with priority queues, time slicing, dedupe replacement, async-flush error handling, and storage-prefixed task id helper.
- Breaking changes: none.
