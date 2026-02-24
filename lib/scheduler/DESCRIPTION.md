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

### `Transaction<C>()`
- File: `transaction.ts`
- Generic:
  - `C extends Record<string | number | symbol, any>` transaction context object.
- Constructor:
  - `new Transaction<C>()`
- Methods:
  - `add(taskName: string, callback: TransactionTask<C>): void`
    - `taskName`: required non-empty task name for logging/tracing.
    - `callback`: task function receiving shared `context`.
  - `apply(): Promise<void>`
    - Executes queued tasks in order.
    - If a task throws, runs rollback stack in reverse order and then rejects.
  - `clear(): void`
    - Clears queued tasks and undo stack.
- Types:
  - `TransactionApplyError`
    - Error object with:
      - `rolledBack: boolean` (rollback completed without rollback-stage failures)
      - `failures: TransactionFailure[]`
  - `TransactionFailure`
    - `{ phase: "apply" | "rollback"; taskName: string; error: unknown }`
  - `TransactionTask<C>`
    - `(context) => void | undo | Promise<void | undo>`
  - `TransactionTaskUndo<C>`
    - `(context) => void | Promise<void>`
- Errors:
  - `add` throws when transaction is flushing or `taskName` is empty.
  - `apply` rejects with `TransactionApplyError` after rollback attempt.

## Changes (date + summary + breaking changes if any)

- 2026-02-16: Added scheduler module with priority queues, time slicing, dedupe replacement, async-flush error handling, and storage-prefixed task id helper.
- 2026-02-24: Added transaction API documentation and updated `Transaction.add` to `add(taskName, callback)` with required task name.
- 2026-02-24: `Transaction.apply` now rejects with structured failure details (`rolledBack`, `failures`) when apply/rollback fails.
- Breaking changes: `Transaction.add` signature changed from `add(callback)` to `add(taskName, callback)`.
