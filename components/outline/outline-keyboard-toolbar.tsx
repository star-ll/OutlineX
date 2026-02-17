import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";

import { OUTLINE_KEYBOARD_TOOLBAR_HEIGHT } from "@/components/outline/constants";
import { IconSymbol } from "@/components/ui/icon-symbol";

type OutlineKeyboardToolbarProps = {
  visible: boolean;
  onAdd: () => void;
  onIndent: () => void;
  onOutdent: () => void;
  colors: {
    icon: string;
    tint: string;
    background: string;
  };
};

export default function OutlineKeyboardToolbar({
  visible,
  onAdd,
  onIndent,
  onOutdent,
  colors,
}: OutlineKeyboardToolbarProps) {
  if (!visible) {
    return null;
  }

  return (
    <KeyboardStickyView style={styles.toolbarLayer}>
      <View
        style={[
          styles.toolbarContent,
          {
            backgroundColor: colors.background,
            borderTopColor: `${colors.icon}55`,
          },
        ]}
      >
        <Pressable
          accessibilityLabel="Add item"
          accessibilityRole="button"
          onPress={onAdd}
          style={[styles.iconButton, { borderColor: colors.tint }]}
        >
          <IconSymbol name="plus" size={16} color={colors.tint} />
        </Pressable>
        <Pressable
          accessibilityLabel="Indent item"
          accessibilityRole="button"
          onPress={onIndent}
          style={[styles.iconButton, { borderColor: colors.icon }]}
        >
          <IconSymbol name="increase.indent" size={16} color={colors.icon} />
        </Pressable>
        <Pressable
          accessibilityLabel="Outdent item"
          accessibilityRole="button"
          onPress={onOutdent}
          style={[styles.iconButton, { borderColor: colors.icon }]}
        >
          <IconSymbol name="decrease.indent" size={16} color={colors.icon} />
        </Pressable>
      </View>
    </KeyboardStickyView>
  );
}

const styles = StyleSheet.create({
  toolbarLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 100,
  },
  toolbarContent: {
    minHeight: OUTLINE_KEYBOARD_TOOLBAR_HEIGHT,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
