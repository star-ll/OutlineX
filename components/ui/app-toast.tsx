import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

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
  backgroundColor = "#1F8A4D",
  textColor = "#FFFFFF",
}: AppToastProps) {
  const [mounted, setMounted] = useState(visible);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

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
            backgroundColor,
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <ThemedText
          style={[styles.message, { color: textColor }]}
          lightColor={textColor}
          darkColor={textColor}
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
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 140,
    alignItems: "center",
  },
  message: {
    fontSize: 13,
    fontWeight: "600",
  },
});
