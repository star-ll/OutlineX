import { debounce } from "@/lib/algorithms/debounce";
import {
  clearRowsByBook,
  insertBookRowIfNotExists,
  insertEdgeRows,
  insertNodeRows,
  listEdgeRowsByBook,
  listNodeRowsByBook,
  touchBookRow,
} from "@/lib/storage/outline-db";

import { initOutlineFeature } from "./bootstrap";
import { OutlineMaps } from "./types";

type PersistPayload = {
  bookId: string;
  maps: OutlineMaps;
};

export function createOutlinePersistenceScheduler(waitMs = 250) {
  const persist = async ({ bookId, maps }: PersistPayload) => {
    try {
      await saveOutlineMaps(bookId, maps);
    } catch (error) {
      console.error("Failed to persist outline", error);
    }
  };

  const debouncedPersist = debounce((payload: PersistPayload) => {
    void persist(payload);
  }, waitMs);

  return {
    schedule(payload: PersistPayload, immediate = false) {
      if (immediate) {
        debouncedPersist.flush(payload);
        return;
      }
      debouncedPersist(payload);
    },
    cancel() {
      debouncedPersist.cancel();
    },
  };
}

export async function loadOutlineMaps(bookId: string): Promise<OutlineMaps> {
  await initOutlineFeature();

  const nodes = await listNodeRowsByBook(bookId);
  const edges = await listEdgeRowsByBook(bookId);

  const dataMap: OutlineMaps["dataMap"] = {};
  for (const row of nodes) {
    dataMap[row.id] = { id: row.id, type: row.type, text: row.text };
  }

  const childrenMap: OutlineMaps["childrenMap"] = {};
  const parentMap: OutlineMaps["parentMap"] = {};

  for (const row of edges) {
    if (!childrenMap[row.parentId]) {
      childrenMap[row.parentId] = [];
    }
    childrenMap[row.parentId].push(row.childId);
    parentMap[row.childId] = row.parentId;
  }

  return { dataMap, childrenMap, parentMap };
}

export async function saveOutlineMaps(bookId: string, maps: OutlineMaps) {
  await initOutlineFeature();

  const now = Date.now();
  await insertBookRowIfNotExists({
    id: bookId,
    title: "未命名笔记",
    createdAt: now,
    updatedAt: now,
  });

  await clearRowsByBook(bookId);

  const nodes = Object.values(maps.dataMap);
  if (nodes.length > 0) {
    await insertNodeRows(bookId, nodes);
  }

  const edges = Object.entries(maps.childrenMap).flatMap(([parentId, children]) =>
    children.map((childId, position) => ({ parentId, childId, position })),
  );
  if (edges.length > 0) {
    await insertEdgeRows(bookId, edges);
  }

  await touchBookRow(bookId, Date.now());
}
