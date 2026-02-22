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
          accessibilityLabel="新增节点"
          accessibilityHint="在当前节点后新增一个同级节点"
          accessibilityRole="button"
          onPress={onAdd}
          style={[styles.iconButton, { borderColor: colors.tint }]}
          hitSlop={8}
        >
          <IconSymbol name="plus" size={16} color={colors.tint} />
        </Pressable>
        <Pressable
          accessibilityLabel="增加缩进"
          accessibilityHint="将当前节点缩进为上一个同级节点的子节点"
          accessibilityRole="button"
          onPress={onIndent}
          style={[styles.iconButton, { borderColor: colors.icon }]}
          hitSlop={8}
        >
          <IconSymbol name="increase.indent" size={16} color={colors.icon} />
        </Pressable>
        <Pressable
          accessibilityLabel="减少缩进"
          accessibilityHint="将当前节点提升到上一级"
          accessibilityRole="button"
          onPress={onOutdent}
          style={[styles.iconButton, { borderColor: colors.icon }]}
          hitSlop={8}
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
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
