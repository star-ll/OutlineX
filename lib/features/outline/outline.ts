import { Priority, Scheduler } from "@/lib/scheduler";
import { getStorageSchedulerId } from "@/lib/scheduler/task-id";
import { AsyncSerialQueue } from "@/lib/algorithms/async-serial-queue";
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
  const scheduler = new Scheduler();
  const scheduledTaskIds = new Set<ReturnType<typeof getStorageSchedulerId>>();
  const pendingPayloadByBook = new Map<string, PersistPayload>();
  const persistQueueByBook = new Map<string, AsyncSerialQueue>();
  const drainingBookIds = new Set<string>();

  const persist = async ({ bookId, maps }: PersistPayload) => {
    try {
      await saveOutlineMaps(bookId, maps);
    } catch (error) {
      console.error("Failed to persist outline", error);
    }
  };

  const getPersistQueue = (bookId: string) => {
    let queue = persistQueueByBook.get(bookId);
    if (!queue) {
      queue = new AsyncSerialQueue();
      persistQueueByBook.set(bookId, queue);
    }
    return queue;
  };

  const drainBookPersist = (bookId: string) => {
    if (drainingBookIds.has(bookId)) {
      return;
    }

    drainingBookIds.add(bookId);
    void getPersistQueue(bookId)
      .enqueue(async () => {
        while (true) {
          const latestPayload = pendingPayloadByBook.get(bookId);
          if (!latestPayload) {
            break;
          }
          pendingPayloadByBook.delete(bookId);
          await persist(latestPayload);
        }
      })
      .finally(() => {
        drainingBookIds.delete(bookId);
        if (pendingPayloadByBook.has(bookId)) {
          drainBookPersist(bookId);
          return;
        }
        persistQueueByBook.delete(bookId);
      });
  };

  return {
    schedule(payload: PersistPayload, immediate = false) {
      const taskId = getStorageSchedulerId(`outline-persist-${payload.bookId}`);
      scheduledTaskIds.add(taskId);
      pendingPayloadByBook.set(payload.bookId, payload);

      scheduler.push({
        id: taskId,
        priority: immediate ? Priority.Sync : Priority.Default,
        delayMs: immediate ? 0 : waitMs,
        callback: () => {
          drainBookPersist(payload.bookId);
          scheduledTaskIds.delete(taskId);
        },
      });
    },
    cancel() {
      for (const taskId of scheduledTaskIds) {
        scheduler.cancel(taskId);
      }
      scheduledTaskIds.clear();
      pendingPayloadByBook.clear();
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
