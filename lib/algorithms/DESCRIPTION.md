## API (exports, params, returns, errors)

### `debounce(fn, waitMs)`
- Exports: `debounce`, `DebouncedFunction`
- Params:
  - `fn`: callback to delay
  - `waitMs`: debounce wait window in milliseconds
- Returns:
  - Debounced function with:
    - callable signature `(...args) => void`
    - `flush(...args) => void` to run immediately
    - `cancel() => void` to clear pending timer
- Errors:
  - No explicit thrown errors; callback exceptions come from caller code.

## Changes (date + summary + breaking changes if any)

- 2026-02-15: Added initial algorithms module description for debounce utility.
- Breaking changes: none.
