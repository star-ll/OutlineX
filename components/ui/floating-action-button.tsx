import React from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

type FloatingActionButtonProps = {
  onPress: () => void;
  backgroundColor: string;
  iconColor: string;
  iconName?: "plus";
  size?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
  accessibilityHint?: string;
};

export function FloatingActionButton({
  onPress,
  backgroundColor,
  iconColor,
  iconName = "plus",
  size = 52,
  style,
  accessibilityLabel,
  accessibilityHint,
}: FloatingActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <IconSymbol name={iconName} size={24} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
