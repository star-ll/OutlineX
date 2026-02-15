export const OUTLINE_DB_NAME = "outline.db";
export const OUTLINE_DB_TABLE_BOOK = "outline_books";
export const OUTLINE_DB_TABLE_DATANODE = "outline_nodes";
export const OUTLINE_DB_TABLE_EDGENODE = "outline_edges";
export const OUTLINE_DB_INDEX_EDGE_PARENT = "outline_edges_parent_idx";
export const OUTLINE_DB_INDEX_NODE_BOOK = "outline_nodes_book_idx";
export const OUTLINE_DB_INDEX_BOOK_UPDATED = "outline_books_updated_idx";

export const DEFAULT_BOOK_ID = "default-book";
export const DEFAULT_BOOK_TITLE = "我的笔记";

export const INIT_OUTLINE_STATEMENTS = [
  {
    sql: `
      CREATE TABLE IF NOT EXISTS ${OUTLINE_DB_TABLE_BOOK} (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
    `,
  },
  {
    sql: `
      CREATE TABLE IF NOT EXISTS ${OUTLINE_DB_TABLE_DATANODE} (
        id TEXT PRIMARY KEY NOT NULL,
        bookId TEXT NOT NULL,
        type TEXT NOT NULL,
        text TEXT NOT NULL
      );
    `,
  },
  {
    sql: `
      CREATE TABLE IF NOT EXISTS ${OUTLINE_DB_TABLE_EDGENODE} (
        bookId TEXT NOT NULL,
        parentId TEXT NOT NULL,
        childId TEXT NOT NULL,
        position INTEGER NOT NULL,
        PRIMARY KEY (bookId, parentId, position),
        UNIQUE (bookId, childId)
      );
    `,
  },
  {
    sql: `CREATE INDEX IF NOT EXISTS ${OUTLINE_DB_INDEX_EDGE_PARENT} ON ${OUTLINE_DB_TABLE_EDGENODE}(bookId, parentId);`,
  },
  {
    sql: `CREATE INDEX IF NOT EXISTS ${OUTLINE_DB_INDEX_NODE_BOOK} ON ${OUTLINE_DB_TABLE_DATANODE}(bookId);`,
  },
  {
    sql: `CREATE INDEX IF NOT EXISTS ${OUTLINE_DB_INDEX_BOOK_UPDATED} ON ${OUTLINE_DB_TABLE_BOOK}(updatedAt DESC);`,
  },
];
