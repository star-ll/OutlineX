import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useShallow } from "zustand/shallow";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useOutlineStore } from "@/stores/outline";
import { OutlineNode } from "@/types/outline";

type OutlineItemProps = {
  item: string;
  siblingIndex: number;
  siblingCount: number;
  depth: number;
  indentSize: number;
  colors: {
    text: string;
    icon: string;
    tint: string;
  };
  inputRefs: React.MutableRefObject<Map<string, TextInput>>;
  onDragStateChange?: (isDragging: boolean) => void;
  onDragTargetChange?: (targetIndex: number) => void;
  renderChildren?: (children: string[], nextDepth: number) => React.ReactNode;
};

let emptyChildren: string[] = [];
export default function OutlineItem({
  item: itemId,
  siblingIndex,
  siblingCount,
  depth,
  indentSize,
  colors,
  inputRefs,
  onDragStateChange,
  onDragTargetChange,
  renderChildren,
}: OutlineItemProps) {
  const item: OutlineNode = useOutlineStore((state) => state.dataMap[itemId])!;

  const {
    setActiveId,
    addItemAfter,
    updateItemText,
    indentItem,
    outdentItem,
    moveItemWithinParent,
    removeItem,
    toggleCollapse,
  } = useOutlineStore(
    useShallow((s) => ({
      setActiveId: s.setActiveId,
      addItemAfter: s.addItemAfter,
      updateItemText: s.updateItemText,
      indentItem: s.indentItem,
      outdentItem: s.outdentItem,
      moveItemWithinParent: s.moveItemWithinParent,
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
  const [dragHandleActive, setDragHandleActive] = useState(false);
  const translateY = useSharedValue(0);
  const dragging = useSharedValue(false);
  const startIndex = useSharedValue(siblingIndex);

  const handleRowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(dragging.value ? 1.01 : 1) }],
    opacity: withTiming(dragging.value ? 0.9 : 1),
  }));

  const dragHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const dragGesture = Gesture.Pan()
    .activateAfterLongPress(240)
    .onBegin(() => {
      dragging.value = true;
      startIndex.value = siblingIndex;
      runOnJS(setActiveId)(item.id);
      runOnJS(setDragHandleActive)(true);
      if (onDragStateChange) {
        runOnJS(onDragStateChange)(true);
      }
      if (onDragTargetChange) {
        runOnJS(onDragTargetChange)(siblingIndex);
      }
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
      const ROW_STEP = 36;
      const shift = Math.round(event.translationY / ROW_STEP);
      const target = Math.max(
        0,
        Math.min(startIndex.value + shift, siblingCount - 1),
      );
      if (onDragTargetChange) {
        runOnJS(onDragTargetChange)(target);
      }
    })
    .onEnd((event) => {
      const ROW_STEP = 36;
      const shift = Math.round(event.translationY / ROW_STEP);
      const target = Math.max(
        0,
        Math.min(startIndex.value + shift, siblingCount - 1),
      );
      runOnJS(moveItemWithinParent)(item.id, target);
    })
    .onFinalize(() => {
      dragging.value = false;
      translateY.value = withTiming(0);
      runOnJS(setDragHandleActive)(false);
      if (onDragStateChange) {
        runOnJS(onDragStateChange)(false);
      }
    });
  const longPressGesture = Gesture.LongPress()
    .minDuration(240)
    .onStart(() => {
      runOnJS(setDragHandleActive)(true);
    });
  const handleGesture = Gesture.Simultaneous(longPressGesture, dragGesture);

  return (
    <>
      <Animated.View
        style={[
          handleRowStyle,
          styles.row,
          { paddingLeft: 12 + depth * indentSize },
          isActive && { backgroundColor: `${colors.tint}1A` },
        ]}
      >
        <Pressable
          onPress={() => setActiveId(item.id)}
          style={styles.rowPressArea}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => (hasChildren ? toggleCollapse(item.id) : null)}
            style={styles.disclosure}
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
          <GestureDetector gesture={handleGesture}>
            <Animated.View style={[styles.dragHandle, dragHandleStyle]}>
              {dragHandleActive ? (
                <IconSymbol
                  size={16}
                  color={colors.icon}
                  name="line.3.horizontal"
                />
              ) : (
                <View style={[styles.bullet, { borderColor: colors.icon }]} />
              )}
            </Animated.View>
          </GestureDetector>
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
            onFocus={() => setActiveId(item.id)}
            onSubmitEditing={() => addItemAfter(item.id)}
            returnKeyType="next"
            style={[
              styles.input,
              {
                color: colors.text,
                fontFamily: Fonts.sans,
              },
            ]}
            placeholder="Write a note..."
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
      </Animated.View>
      {hasChildren && !collapsed ? renderChildren?.(children, depth + 1) : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    overflow: "visible",
  },
  rowPressArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 10,
  },
  disclosure: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  disclosureSpacer: {
    width: 14,
    height: 14,
  },
  dragHandle: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
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
