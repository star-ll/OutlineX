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

### Outline map APIs
- `loadOutlineMaps(bookId: string): Promise<OutlineMaps>`
- `saveOutlineMaps(bookId: string, maps: OutlineMaps): Promise<void>`
- Errors:
  - Propagate storage-layer failures.

### `createOutlinePersistenceScheduler(waitMs?: number)`
- Params:
  - `waitMs`: debounce interval in milliseconds, default `250`
- Returns:
  - `{ schedule(payload, immediate?), cancel() }`
  - `payload`: `{ bookId: string; maps: OutlineMaps }`
- Behavior:
  - Debounced persistence wrapper for `saveOutlineMaps`.
  - Immediate mode runs via `flush`.
- Errors:
  - Internal errors are caught and logged.

## Changes (date + summary + breaking changes if any)

- 2026-02-15: Added architecture-compliant persistence scheduler API and module documentation.
- Breaking changes: none.
