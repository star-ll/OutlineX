## API (exports, params, returns, errors)

### Database access
- `runStatements(statements: SqlStatement[]): Promise<void>`
  - Executes SQL statements sequentially.
- `queryAll<T>(sql: string, args?: SQLiteBindParams): Promise<T[]>`
  - Runs a query and returns all rows.
- `runInDbTransaction<T>(callback: () => Promise<T>): Promise<T>`
  - Runs callback inside a single SQLite transaction (`BEGIN/COMMIT/ROLLBACK` handled by expo-sqlite transaction API).

### Schema lifecycle
- `applyInitSchema(): Promise<void>`
- `dropAllTables(): Promise<void>`
- `clearAllRows(): Promise<void>`
- `getTableSqlMap(tableNames: string[]): Promise<Map<string, string>>`
- Note:
  - DB connection enables `PRAGMA foreign_keys = ON`.
  - Schema defines real foreign keys and cascade delete from books to nodes/edges.

### Book table APIs
- `listBookRows(): Promise<BookRow[]>`
- `getBookRowById(bookId: string): Promise<BookRow | null>`
- `insertBookRow(book: BookRow): Promise<void>`
- `insertBookRowIfNotExists(book: BookRow): Promise<void>`
- `upsertBookRow(book: BookRow): Promise<void>`
- `updateBookTitleRow(bookId: string, title: string, updatedAt: number): Promise<void>`
- `touchBookRow(bookId: string, updatedAt: number): Promise<void>`
- `deleteBookRowById(bookId: string): Promise<void>`

### Outline rows APIs
- `listNodeRowsByBook(bookId: string): Promise<OutlineNode[]>`
- `listEdgeRowsByBook(bookId: string): Promise<EdgeRow[]>`
- `clearRowsByBook(bookId: string): Promise<void>`
- `insertNodeRows(bookId: string, nodes: OutlineNode[]): Promise<void>`
- `insertEdgeRows(bookId: string, edges: Array<{ parentId: string; childId: string; position: number }>): Promise<void>`

### Errors
- All APIs propagate SQLite/runtime errors to callers.

## Changes (date + summary + breaking changes if any)

- 2026-02-24: Added `runInDbTransaction` to support atomic multi-step writes from feature layer.
- 2026-02-24: Added `getBookRowById` and `upsertBookRow` helper APIs.
- 2026-02-24: Enabled real foreign key constraints (`ON DELETE CASCADE`) in schema and DB connection.
- Breaking changes: none.
