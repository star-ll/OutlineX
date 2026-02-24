import {
  DEFAULT_BOOK_ID,
  DEFAULT_BOOK_TITLE,
  OUTLINE_DB_TABLE_BOOK,
  OUTLINE_DB_TABLE_DATANODE,
  OUTLINE_DB_TABLE_EDGENODE,
} from "@/constants/db";
import {
  applyInitSchema,
  dropAllTables,
  getTableSqlMap,
  insertBookRowIfNotExists,
} from "@/lib/storage/outline-db";

let initPromise: Promise<void> | null = null;

function isSchemaCompatible(tableSqlMap: Map<string, string>) {
  if (tableSqlMap.size === 0) {
    return true;
  }

  const booksSql = tableSqlMap.get(OUTLINE_DB_TABLE_BOOK) ?? "";
  const nodesSql = tableSqlMap.get(OUTLINE_DB_TABLE_DATANODE) ?? "";
  const edgesSql = tableSqlMap.get(OUTLINE_DB_TABLE_EDGENODE) ?? "";

  const booksOk =
    booksSql.includes("title TEXT NOT NULL") &&
    booksSql.includes("createdAt INTEGER NOT NULL") &&
    booksSql.includes("updatedAt INTEGER NOT NULL");
  const nodesOk =
    nodesSql.includes("bookId TEXT NOT NULL") &&
    nodesSql.includes("UNIQUE (bookId, id)") &&
    nodesSql.includes(
      `FOREIGN KEY (bookId) REFERENCES ${OUTLINE_DB_TABLE_BOOK}(id) ON DELETE CASCADE`,
    );
  const edgesOk =
    edgesSql.includes("bookId TEXT NOT NULL") &&
    edgesSql.includes("PRIMARY KEY (bookId, parentId, position)") &&
    edgesSql.includes("UNIQUE (bookId, childId)") &&
    edgesSql.includes(
      `FOREIGN KEY (bookId) REFERENCES ${OUTLINE_DB_TABLE_BOOK}(id) ON DELETE CASCADE`,
    ) &&
    edgesSql.includes(
      `FOREIGN KEY (bookId, parentId) REFERENCES ${OUTLINE_DB_TABLE_DATANODE}(bookId, id) ON DELETE CASCADE`,
    ) &&
    edgesSql.includes(
      `FOREIGN KEY (bookId, childId) REFERENCES ${OUTLINE_DB_TABLE_DATANODE}(bookId, id) ON DELETE CASCADE`,
    );

  return booksOk && nodesOk && edgesOk;
}

export async function ensureDefaultBook() {
  const now = Date.now();
  await insertBookRowIfNotExists({
    id: DEFAULT_BOOK_ID,
    title: DEFAULT_BOOK_TITLE,
    createdAt: now,
    updatedAt: now,
  });
}

export async function initOutlineFeature() {
  if (!initPromise) {
    initPromise = (async () => {
      const tableSqlMap = await getTableSqlMap([
        OUTLINE_DB_TABLE_BOOK,
        OUTLINE_DB_TABLE_DATANODE,
        OUTLINE_DB_TABLE_EDGENODE,
      ]);

      if (!isSchemaCompatible(tableSqlMap)) {
        await dropAllTables();
      }

      await applyInitSchema();
      await ensureDefaultBook();
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  await initPromise;
}
