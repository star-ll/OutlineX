import {
  clearAllRows,
  deleteBookRowById,
  insertBookRow,
  listBookRows,
  runInDbTransaction,
  updateBookTitleRow,
} from "@/lib/storage/outline-db";
import { uuidV7 } from "@/utils/uuid";

import { ensureDefaultBook, initOutlineFeature } from "./bootstrap";

export async function listBooks() {
  await initOutlineFeature();
  return listBookRows();
}

export async function createBook(title?: string) {
  await initOutlineFeature();

  const now = Date.now();
  const normalizedTitle = title?.trim() || "未命名笔记";
  const book = {
    id: uuidV7(),
    title: normalizedTitle,
    createdAt: now,
    updatedAt: now,
  };

  await insertBookRow(book);
  return book;
}

export async function renameBook(bookId: string, title: string) {
  await initOutlineFeature();

  const normalizedTitle = title.trim();
  if (!normalizedTitle) {
    return;
  }

  await updateBookTitleRow(bookId, normalizedTitle, Date.now());
}

export async function deleteBook(bookId: string) {
  await initOutlineFeature();
  await runInDbTransaction(async () => {
    await deleteBookRowById(bookId);
    await ensureDefaultBook();
  });
}

export async function clearAllBooksAndNodes() {
  await initOutlineFeature();
  await runInDbTransaction(async () => {
    await clearAllRows();
    await ensureDefaultBook();
  });
}
