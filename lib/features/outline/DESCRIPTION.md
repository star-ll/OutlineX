## API (exports, params, returns, errors)

### `initOutlineFeature()`
- Params: none
- Returns: `Promise<void>`
- Errors:
  - Propagates schema/query failures during initialization.

### Book APIs
- `listBooks(): Promise<OutlineBook[]>`
- `createBook(title?: string): Promise<OutlineBook>`
- `renameBook(bookId: string, title: string): Promise<void>`
- `deleteBook(bookId: string): Promise<void>`
- `clearAllBooksAndNodes(): Promise<void>`
- Errors:
  - Propagate storage-layer failures.
  - `deleteBook` and `clearAllBooksAndNodes` are executed in a single SQLite transaction.

### Outline map APIs
- `loadOutlineMaps(bookId: string): Promise<OutlineMaps>`
- `saveOutlineMaps(bookId: string, maps: OutlineMaps): Promise<void>`
- Errors:
  - Propagate storage-layer failures.
  - `saveOutlineMaps` is executed in a single SQLite transaction.

### `createOutlinePersistenceScheduler(waitMs?: number)`
- Params:
  - `waitMs`: delay window in milliseconds, default `250`
- Returns:
  - `{ schedule(payload, immediate?), cancel() }`
  - `payload`: `{ bookId: string; maps: OutlineMaps }`
- Behavior:
  - Uses `lib/scheduler` to enqueue storage persistence tasks.
  - Task ids use `storage-` prefix and are deduped by `bookId` with latest-task wins.
  - Immediate mode schedules as `Priority.Sync`; otherwise delayed `Priority.Default`.
  - Persists are serialized per `bookId`, and pending payloads are coalesced to the latest snapshot before each write.
- Errors:
  - Internal errors are caught and logged.

## Changes (date + summary + breaking changes if any)

- 2026-02-15: Added architecture-compliant persistence scheduler API and module documentation.
- 2026-02-16: Switched outline persistence scheduling from debounce timer to scheduler-layer queue with dedupe and priority support.
- 2026-02-23: Added per-book serial persistence queue and latest-snapshot coalescing to avoid concurrent DB write races.
- 2026-02-24: Refactored `deleteBook`, `clearAllBooksAndNodes`, and `saveOutlineMaps` to single SQLite transactions for atomic writes.
- 2026-02-24: Upgraded schema compatibility checks to require real FK/CASCADE constraints for books/nodes/edges.
- Breaking changes: none.
