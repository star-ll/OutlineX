import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

type AppToastProps = {
  visible: boolean;
  message: string;
  duration?: number;
  onHide: () => void;
  backgroundColor?: string;
  textColor?: string;
};

export function AppToast({
  visible,
  message,
  duration = 1600,
  onHide,
  backgroundColor,
  textColor,
}: AppToastProps) {
  const colorScheme = useColorScheme() ?? "light";
  const [mounted, setMounted] = useState(visible);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const resolvedBackgroundColor =
    backgroundColor ?? (colorScheme === "dark" ? "rgba(255,255,255,0.94)" : "#FFFFFF");
  const resolvedTextColor = textColor ?? "#111111";
  const resolvedBorderColor =
    colorScheme === "dark" ? "rgba(17,17,17,0.16)" : "rgba(17,17,17,0.08)";

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      hideTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 12,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (!finished) {
            return;
          }
          setMounted(false);
          onHide();
        });
      }, duration);
    }

    return () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
    };
  }, [duration, onHide, opacity, translateY, visible]);

  if (!mounted) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.root}>
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: resolvedBackgroundColor,
            borderColor: resolvedBorderColor,
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <ThemedText
          style={[styles.message, { color: resolvedTextColor }]}
          lightColor={resolvedTextColor}
          darkColor={resolvedTextColor}
        >
          {message}
        </ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 28,
    alignItems: "center",
  },
  toast: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 11,
    minWidth: 140,
    maxWidth: "90%",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  message: {
    fontSize: 13,
    fontWeight: "600",
  },
});
