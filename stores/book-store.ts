import { create } from "zustand";

import {
  clearAllBooksAndNodes,
  createBook as createBookFeature,
  renameBook as renameBookFeature,
  listBooks,
  type OutlineBook,
} from "@/lib/features/outline";

type BookState = {
  books: OutlineBook[];
  hasHydrated: boolean;
  isLoading: boolean;
  hydrate: () => Promise<void>;
  refreshBooks: () => Promise<void>;
  createBook: (title?: string) => Promise<OutlineBook>;
  renameBook: (bookId: string, title: string) => Promise<void>;
  clearAllBooks: () => Promise<void>;
};

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  hasHydrated: false,
  isLoading: false,
  hydrate: async () => {
    if (get().hasHydrated) {
      return;
    }
    await get().refreshBooks();
    set({ hasHydrated: true });
  },
  refreshBooks: async () => {
    set({ isLoading: true });
    try {
      const rows = await listBooks();
      set({ books: rows });
    } finally {
      set({ isLoading: false });
    }
  },
  createBook: async (title) => {
    const book = await createBookFeature(title);
    set((state) => ({ books: [book, ...state.books] }));
    return book;
  },
  renameBook: async (bookId, title) => {
    await renameBookFeature(bookId, title);
    set((state) => ({
      books: state.books.map((book) =>
        book.id === bookId
          ? {
              ...book,
              title: title.trim() || book.title,
              updatedAt: Date.now(),
            }
          : book,
      ),
    }));
  },
  clearAllBooks: async () => {
    await clearAllBooksAndNodes();
    const rows = await listBooks();
    set({ books: rows, hasHydrated: true });
  },
}));
