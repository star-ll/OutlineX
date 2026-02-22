import { useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

import { useThemeStore } from "@/stores/theme";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (mode === "dark") {
    return "dark";
  }

  if (hasHydrated) {
    return colorScheme;
  }

  return "light";
}
