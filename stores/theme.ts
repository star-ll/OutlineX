import { create } from "zustand";

type ThemeMode = "system" | "dark";

type ThemeState = {
  mode: ThemeMode;
  enableDarkMode: () => void;
  disableDarkMode: () => void;
  toggleDarkMode: () => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "system",
  enableDarkMode: () => set({ mode: "dark" }),
  disableDarkMode: () => set({ mode: "system" }),
  toggleDarkMode: () => {
    const nextMode = get().mode === "dark" ? "system" : "dark";
    set({ mode: nextMode });
  },
}));
