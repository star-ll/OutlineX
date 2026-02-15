import * as SQLite from "expo-sqlite";

import {
  INIT_OUTLINE_STATEMENTS,
  OUTLINE_DB_NAME,
  OUTLINE_DB_TABLE_BOOK,
  OUTLINE_DB_TABLE_DATANODE,
  OUTLINE_DB_TABLE_EDGENODE,
} from "@/constants/db";
import { OutlineNode } from "@/types/outline";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export type SqlStatement = {
  sql: string;
  args?: SQLite.SQLiteBindParams;
};

export type BookRow = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};

export type EdgeRow = {
  parentId: string;
  childId: string;
  position: number;
};

const getDb = () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(OUTLINE_DB_NAME);
  }
  return dbPromise;
};

export async function runStatements(statements: SqlStatement[]) {
  const db = await getDb();
  for (const statement of statements) {
    await db.runAsync(statement.sql, statement.args ?? []);
  }
}

export async function queryAll<T = unknown>(
  sql: string,
  args: SQLite.SQLiteBindParams = [],
) {
  const db = await getDb();
  return db.getAllAsync<T>(sql, args);
}

export async function applyInitSchema() {
  await runStatements(INIT_OUTLINE_STATEMENTS);
}

export async function dropAllTables() {
  await runStatements([
    { sql: `DROP TABLE IF EXISTS ${OUTLINE_DB_TABLE_EDGENODE};` },
    { sql: `DROP TABLE IF EXISTS ${OUTLINE_DB_TABLE_DATANODE};` },
    { sql: `DROP TABLE IF EXISTS ${OUTLINE_DB_TABLE_BOOK};` },
  ]);
}

export async function clearAllRows() {
  await runStatements([
    { sql: `DELETE FROM ${OUTLINE_DB_TABLE_EDGENODE};` },
    { sql: `DELETE FROM ${OUTLINE_DB_TABLE_DATANODE};` },
    { sql: `DELETE FROM ${OUTLINE_DB_TABLE_BOOK};` },
  ]);
}

export async function getTableSqlMap(tableNames: string[]) {
  if (tableNames.length === 0) {
    return new Map<string, string>();
  }

  const placeholders = tableNames.map(() => "?").join(", ");
  const rows = await queryAll<{ name: string; sql: string | null }>(
    `SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name IN (${placeholders});`,
    tableNames,
  );

  return new Map(rows.map((row) => [row.name, row.sql ?? ""]));
}

export async function listBookRows() {
  return queryAll<BookRow>(
    `SELECT id, title, createdAt, updatedAt FROM ${OUTLINE_DB_TABLE_BOOK} ORDER BY updatedAt DESC;`,
  );
}

export async function insertBookRow(book: BookRow) {
  await runStatements([
    {
      sql: `INSERT INTO ${OUTLINE_DB_TABLE_BOOK} (id, title, createdAt, updatedAt) VALUES (?, ?, ?, ?);`,
      args: [book.id, book.title, book.createdAt, book.updatedAt],
    },
  ]);
}

export async function insertBookRowIfNotExists(book: BookRow) {
  await runStatements([
    {
      sql: `INSERT OR IGNORE INTO ${OUTLINE_DB_TABLE_BOOK} (id, title, createdAt, updatedAt) VALUES (?, ?, ?, ?);`,
      args: [book.id, book.title, book.createdAt, book.updatedAt],
    },
  ]);
}

export async function updateBookTitleRow(bookId: string, title: string, updatedAt: number) {
  await runStatements([
    {
      sql: `UPDATE ${OUTLINE_DB_TABLE_BOOK} SET title = ?, updatedAt = ? WHERE id = ?;`,
      args: [title, updatedAt, bookId],
    },
  ]);
}

export async function touchBookRow(bookId: string, updatedAt: number) {
  await runStatements([
    {
      sql: `UPDATE ${OUTLINE_DB_TABLE_BOOK} SET updatedAt = ? WHERE id = ?;`,
      args: [updatedAt, bookId],
    },
  ]);
}

export async function deleteBookRowById(bookId: string) {
  await runStatements([
    {
      sql: `DELETE FROM ${OUTLINE_DB_TABLE_BOOK} WHERE id = ?;`,
      args: [bookId],
    },
  ]);
}

export async function listNodeRowsByBook(bookId: string) {
  return queryAll<OutlineNode>(
    `SELECT id, type, text FROM ${OUTLINE_DB_TABLE_DATANODE} WHERE bookId = ?;`,
    [bookId],
  );
}

export async function listEdgeRowsByBook(bookId: string) {
  return queryAll<EdgeRow>(
    `SELECT parentId, childId, position FROM ${OUTLINE_DB_TABLE_EDGENODE} WHERE bookId = ? ORDER BY parentId, position;`,
    [bookId],
  );
}

export async function clearRowsByBook(bookId: string) {
  await runStatements([
    {
      sql: `DELETE FROM ${OUTLINE_DB_TABLE_EDGENODE} WHERE bookId = ?;`,
      args: [bookId],
    },
    {
      sql: `DELETE FROM ${OUTLINE_DB_TABLE_DATANODE} WHERE bookId = ?;`,
      args: [bookId],
    },
  ]);
}

export async function insertNodeRows(bookId: string, nodes: OutlineNode[]) {
  await runStatements(
    nodes.map((node) => ({
      sql: `INSERT INTO ${OUTLINE_DB_TABLE_DATANODE} (id, bookId, type, text) VALUES (?, ?, ?, ?);`,
      args: [node.id, bookId, node.type, node.text],
    })),
  );
}

export async function insertEdgeRows(
  bookId: string,
  edges: Array<{ parentId: string; childId: string; position: number }>,
) {
  await runStatements(
    edges.map((edge) => ({
      sql: `INSERT INTO ${OUTLINE_DB_TABLE_EDGENODE} (bookId, parentId, childId, position) VALUES (?, ?, ?, ?);`,
      args: [bookId, edge.parentId, edge.childId, edge.position],
    })),
  );
}
