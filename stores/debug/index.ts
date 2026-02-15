import { create } from "zustand";

import { DEFAULT_BOOK_ID } from "@/constants/db";
import {
  clearDebugDatabase,
  createLargeDebugBook,
} from "@/lib/features/debug";
import { useBookStore } from "@/stores/book";
import { useOutlineStore } from "@/stores/outline";

type DebugState = {
  clearing: boolean;
  seedingLargeBook: boolean;
  clearDatabase: () => Promise<void>;
  createLargeBook: () => Promise<{ id: string; title: string }>;
};

export const useDebugStore = create<DebugState>((set) => ({
  clearing: false,
  seedingLargeBook: false,
  clearDatabase: async () => {
    set({ clearing: true });
    try {
      await clearDebugDatabase();
      await Promise.all([
        useBookStore.getState().refreshBooks(),
        useOutlineStore.getState().loadBook(DEFAULT_BOOK_ID),
      ]);
    } finally {
      set({ clearing: false });
    }
  },
  createLargeBook: async () => {
    set({ seedingLargeBook: true });
    try {
      const book = await createLargeDebugBook();

      await Promise.all([
        useBookStore.getState().refreshBooks(),
        useOutlineStore.getState().loadBook(book.id),
      ]);

      return { id: book.id, title: book.title };
    } finally {
      set({ seedingLargeBook: false });
    }
  },
}));
