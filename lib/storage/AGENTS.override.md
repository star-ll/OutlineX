# Module Rules (lib/storage)

This directory belongs to the Storage layer.

## Dependency Rules

- `lib/storage/**` MUST NOT depend on UI/State/Feature.

## Outline Relational Rules

- `outline_books`:
  primary key is `id`.
- `outline_nodes`:
  primary key is `id`;
  logical foreign key `bookId -> outline_books.id` (must always reference an existing book).
- `outline_edges`:
  composite primary key is `(bookId, parentId, position)`;
  unique key is `(bookId, childId)`;
  logical foreign key `bookId -> outline_books.id`;
  logical foreign key `(bookId, parentId)` and `(bookId, childId)` -> `outline_nodes` records under the same `bookId`.
- Any write affecting `outline_books.id` or `outline_nodes.id` MUST keep the above key dependencies consistent in `outline_nodes` and `outline_edges`.

## Document-first

If you modify files under this directory, you **must** update `DESCRIPTION.md` in the same directory.

`DESCRIPTION.md` format:

- ## API (exports, params, returns, errors)
- ## Changes (date + summary + breaking changes if any)
