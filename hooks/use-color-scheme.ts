import { useColorScheme as useRNColorScheme } from "react-native";

import { useThemeStore } from "@/stores/theme";

export function useColorScheme() {
  const systemColorScheme = useRNColorScheme();
  const mode = useThemeStore((state) => state.mode);

  if (mode === "dark") {
    return "dark";
  }

  return systemColorScheme;
}
