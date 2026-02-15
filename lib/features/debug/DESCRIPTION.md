## API (exports, params, returns, errors)

### `clearDebugDatabase()`
- Params: none
- Returns: `Promise<void>`
- Errors:
  - Propagates storage/feature errors from clear operations.

### `createLargeDebugBook()`
- Params: none
- Returns:
  - `Promise<{ id: string; title: string }>`
- Behavior:
  - Creates a new book and writes a generated 10,000-node root outline.
- Errors:
  - Propagates create/save failures from outline feature APIs.

## Changes (date + summary + breaking changes if any)

- 2026-02-15: Added debug feature module description.
- Breaking changes: none.
