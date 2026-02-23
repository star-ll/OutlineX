import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useOutlineStore } from "@/stores/outline";
import { OutlineNode } from "@/types/outline";

type OutlineItemProps = {
  item: string;
  depth: number;
  indentSize: number;
  colors: {
    text: string;
    icon: string;
    tint: string;
  };
  inputRefs: React.MutableRefObject<Map<string, TextInput>>;
  onDragStart?: () => void;
  isDragging?: boolean;
  onInputFocusChange?: (focused: boolean) => void;
  renderChildren?: (children: string[], nextDepth: number) => React.ReactNode;
};

let emptyChildren: string[] = [];
export default function OutlineItem({
  item: itemId,
  depth,
  indentSize,
  colors,
  inputRefs,
  onDragStart,
  isDragging = false,
  onInputFocusChange,
  renderChildren,
}: OutlineItemProps) {
  const item: OutlineNode = useOutlineStore((state) => state.dataMap[itemId])!;

  const {
    setActiveId,
    addItemAfter,
    updateItemText,
    indentItem,
    outdentItem,
    removeItem,
    toggleCollapse,
  } = useOutlineStore(
    useShallow((s) => ({
      setActiveId: s.setActiveId,
      addItemAfter: s.addItemAfter,
      updateItemText: s.updateItemText,
      indentItem: s.indentItem,
      outdentItem: s.outdentItem,
      removeItem: s.removeItem,
      toggleCollapse: s.toggleCollapse,
    })),
  );

  const activeId = useOutlineStore((state) => state.activeId);
  const isActive = activeId === item.id;
  const collapsedIds = useOutlineStore((state) => state.collapsedIds);
  const collapsed = Boolean(collapsedIds[item.id]);

  const children = useOutlineStore(
    useShallow((state) => state.childrenMap[itemId] ?? emptyChildren),
  );
  const hasChildren = !!children?.length;

  return (
    <>
      <View
        style={[
          styles.row,
          { paddingLeft: 12 + depth * indentSize },
          isActive && { backgroundColor: `${colors.tint}1A` },
          isDragging && styles.draggingRow,
        ]}
      >
        <Pressable
          onPress={() => setActiveId(item.id)}
          style={styles.rowPressArea}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={collapsed ? "展开子节点" : "折叠子节点"}
            onPress={() => (hasChildren ? toggleCollapse(item.id) : null)}
            style={styles.disclosure}
            hitSlop={8}
          >
            {hasChildren ? (
              <IconSymbol
                size={18}
                color={colors.icon}
                name="chevron.right"
                style={{
                  transform: [{ rotate: collapsed ? "0deg" : "90deg" }],
                }}
              />
            ) : (
              <View style={styles.disclosureSpacer} />
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="拖拽排序"
            onLongPress={() => {
              setActiveId(item.id);
              onDragStart?.();
            }}
            delayLongPress={240}
            style={styles.dragHandle}
            hitSlop={8}
          >
            {isDragging ? (
              <IconSymbol
                size={16}
                color={colors.icon}
                name="line.3.horizontal"
              />
            ) : (
              <View style={[styles.bullet, { borderColor: colors.icon }]} />
            )}
          </Pressable>
          <TextInput
            ref={(ref) => {
              if (ref) {
                inputRefs.current.set(item.id, ref);
              } else {
                inputRefs.current.delete(item.id);
              }
            }}
            value={item.text}
            onChangeText={(text) => updateItemText(item.id, text)}
            onFocus={() => {
              setActiveId(item.id);
              onInputFocusChange?.(true);
            }}
            onBlur={() => {
              onInputFocusChange?.(false);
            }}
            onSubmitEditing={() => addItemAfter(item.id)}
            returnKeyType="next"
            style={[
              styles.input,
              {
                color: colors.text,
                fontFamily: Fonts.sans,
              },
            ]}
            placeholder="输入内容..."
            placeholderTextColor={colors.icon}
            blurOnSubmit={false}
            onKeyPress={(event) => {
              const { key } = event.nativeEvent;
              if (key === "Tab") {
                if ((event.nativeEvent as { shiftKey?: boolean }).shiftKey) {
                  outdentItem(item.id);
                } else {
                  indentItem(item.id);
                }
              }
              if (key === "Backspace" && item.text.length === 0) {
                removeItem(item.id);
              }
            }}
          />
        </Pressable>
      </View>
      {hasChildren && !collapsed ? renderChildren?.(children, depth + 1) : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    overflow: "visible",
  },
  draggingRow: {
    opacity: 0.9,
    transform: [{ scale: 1.01 }],
  },
  rowPressArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 10,
  },
  disclosure: {
    width: 20,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  disclosureSpacer: {
    width: 24,
    height: 24,
  },
  dragHandle: {
    width: 20,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
});
