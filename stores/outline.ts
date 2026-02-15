import { create } from "zustand";

import { DEFAULT_BOOK_ID } from "@/constants/db";
import {
  createOutlinePersistenceScheduler,
  loadOutlineMaps,
} from "@/lib/features/outline";
import { OutlineNode } from "@/types/outline";
import { uuidV7 } from "@/utils/uuid";

const ROOT_ID = "root";
const outlinePersistenceScheduler = createOutlinePersistenceScheduler(250);

const schedulePersist = (
  bookId: string,
  dataMap: Record<string, OutlineNode>,
  parentMap: Record<string, string>,
  childrenMap: Record<string, string[]>,
  immediate = false,
) => {
  outlinePersistenceScheduler.schedule(
    { bookId, maps: { dataMap, parentMap, childrenMap } },
    immediate,
  );
};

type OutlineState = {
  childrenMap: Record<string, string[]>;
  parentMap: Record<string, string>;
  dataMap: Record<string, OutlineNode>;
  activeId: string | null;
  collapsedIds: Record<string, boolean>;
  rootId: "root";
  currentBookId: string;
  hasHydrated: boolean;
  hydrate: () => Promise<void>;
  loadBook: (bookId: string) => Promise<void>;
  setActiveId: (id: string | null) => void;
  toggleCollapse: (id: string) => void;
  addItemAfter: (afterId?: string) => string;
  updateItemText: (id: string, text: string) => void;
  indentItem: (id: string) => void;
  outdentItem: (id: string) => void;
  moveItemWithinParent: (id: string, targetIndex: number) => void;
  removeItem: (id: string) => void;
};

let hydrationPromise: Promise<void> | null = null;

export const useOutlineStore = create<OutlineState>((set, get) => ({
  rootId: ROOT_ID,
  currentBookId: DEFAULT_BOOK_ID,
  parentMap: {},
  childrenMap: {},
  dataMap: {},
  activeId: null,
  collapsedIds: {},
  hasHydrated: false,
  hydrate: async () => {
    await get().loadBook(get().currentBookId || DEFAULT_BOOK_ID);
  },
  loadBook: async (bookId) => {
    if (get().hasHydrated && get().currentBookId === bookId) {
      return;
    }

    if (!hydrationPromise || get().currentBookId !== bookId) {
      hydrationPromise = (async () => {
        try {
          const maps = await loadOutlineMaps(bookId);
          set({
            dataMap: maps.dataMap,
            parentMap: maps.parentMap,
            childrenMap: maps.childrenMap,
            currentBookId: bookId,
            activeId: null,
            collapsedIds: {},
            hasHydrated: true,
          });
        } catch (error) {
          console.error("Failed to hydrate outline store", error);
        }
      })();
    }

    await hydrationPromise;
  },
  setActiveId: (id) => set({ activeId: id }),
  toggleCollapse: (id) =>
    set((state) => ({
      collapsedIds: { ...state.collapsedIds, [id]: !state.collapsedIds[id] },
    })),
  addItemAfter: (afterId?: string) => {
    const id = uuidV7();
    set((state) => {
      const newItem: OutlineNode = {
        id,
        type: "text",
        text: "",
      };

      const parentId =
        afterId == null ? state.rootId : state.parentMap[afterId];
      const children = [...(state.childrenMap[parentId] || [])];
      const afterIndex = children?.findIndex((i) => i === afterId);

      if (afterIndex === -1) {
        children.push(id);
      } else {
        children.splice(afterIndex + 1, 0, id);
      }

      const dataMap = { ...state.dataMap, [id]: newItem };
      const parentMap = { ...state.parentMap, [id]: parentId };
      const childrenMap = { ...state.childrenMap, [parentId]: [...children] };

      schedulePersist(
        state.currentBookId,
        dataMap,
        parentMap,
        childrenMap,
        true,
      );

      return {
        dataMap,
        parentMap,
        childrenMap,
        activeId: id,
      };
    });

    return id;
  },
  updateItemText: (id, text) =>
    set((state) => {
      const dataMap = { ...state.dataMap };
      const item = { ...dataMap[id] };

      if (!item) {
        return state;
      }

      item.text = text;
      dataMap[id] = item;

      schedulePersist(
        state.currentBookId,
        dataMap,
        state.parentMap,
        state.childrenMap,
      );

      return { dataMap };
    }),
  indentItem: (id) =>
    set((state) => {
      const childrenMap = { ...state.childrenMap };
      const parentMap = { ...state.parentMap };
      const oldParentId = parentMap[id];
      const items = [...(childrenMap[oldParentId] || [])];
      const index = items.findIndex((i) => i === id);

      const prevIndex = index - 1;

      if (prevIndex < 0) {
        return state;
      }

      const parentId = items[prevIndex];
      const parentChildren = [...(childrenMap[parentId] || [])];

      items.splice(index, 1);
      childrenMap[oldParentId] = items;

      parentMap[id] = parentId;
      parentChildren.push(id);
      childrenMap[parentId] = parentChildren;

      schedulePersist(
        state.currentBookId,
        state.dataMap,
        parentMap,
        childrenMap,
        true,
      );

      return {
        childrenMap,
        parentMap,
      };
    }),
  outdentItem: (id) =>
    set((state) => {
      const childrenMap = { ...state.childrenMap };
      const parentMap = { ...state.parentMap };
      const oldParentId = parentMap[id];

      const items = [...(childrenMap[oldParentId] || [])];
      const index = items.findIndex((i) => i === id);

      if (index === -1) {
        return state;
      }
      items.splice(index, 1);
      childrenMap[oldParentId] = items;

      const parentId = parentMap[oldParentId];
      if (!parentId) {
        return state;
      }

      parentMap[id] = parentId;

      const parentItems = [...(childrenMap[parentId] || [])];
      const prevIndex = parentItems.findIndex((i) => i === oldParentId);

      if (prevIndex === -1) {
        return state;
      }
      parentItems.splice(prevIndex + 1, 0, id);
      childrenMap[parentId] = parentItems;

      schedulePersist(
        state.currentBookId,
        state.dataMap,
        parentMap,
        childrenMap,
        true,
      );

      return {
        childrenMap,
        parentMap,
      };
    }),
  moveItemWithinParent: (id, targetIndex) =>
    set((state) => {
      const parentId = state.parentMap[id];
      if (!parentId) {
        return state;
      }

      const siblings = [...(state.childrenMap[parentId] || [])];
      const currentIndex = siblings.findIndex((childId) => childId === id);
      if (currentIndex === -1) {
        return state;
      }

      const toIndex = Math.max(0, Math.min(targetIndex, siblings.length - 1));
      if (toIndex === currentIndex) {
        return state;
      }

      siblings.splice(currentIndex, 1);
      siblings.splice(toIndex, 0, id);

      const childrenMap = {
        ...state.childrenMap,
        [parentId]: siblings,
      };

      schedulePersist(
        state.currentBookId,
        state.dataMap,
        state.parentMap,
        childrenMap,
      );

      return { childrenMap };
    }),
  removeItem: (id) =>
    set((state) => {
      const dataMap = { ...state.dataMap };
      const parentMap = { ...state.parentMap };
      const childrenMap = { ...state.childrenMap };

      const removeSubTree = (removeId: string) => {
        const parentId = parentMap[removeId];
        const children = [...(childrenMap[parentId] || [])];
        const childIndex = children.findIndex((i) => i === removeId);

        if (parentId == null) {
          console.error(`parentId ${parentId} don't exist!`);
          throw new Error(`parentId ${parentId} don't exist!`);
        }

        const currentChildren = [...(childrenMap[removeId] || [])];
        for (const child of currentChildren) {
          removeSubTree(child);
        }

        delete dataMap[removeId];
        delete parentMap[removeId];
        if (childIndex !== -1) {
          children.splice(childIndex, 1);
          childrenMap[parentId] = children;
        }
        delete childrenMap[removeId];

        return childIndex === 0 ? null : children[childIndex - 1];
      };

      const activeId = removeSubTree(id);

      schedulePersist(
        state.currentBookId,
        dataMap,
        parentMap,
        childrenMap,
        true,
      );

      return {
        dataMap,
        parentMap,
        childrenMap,
        activeId,
      };
    }),
}));
