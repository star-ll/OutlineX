import React, { memo, useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import DraggableFlatList, {
  type RenderItemParams,
} from "react-native-draggable-flatlist";

import OutlineItem from "@/components/outline/outline-item";
import { useOutlineStore } from "@/stores/outline";

type OutlineItemListProps = {
  items: string[];
  level?: number;
  indentSize: number;
  colors: {
    text: string;
    icon: string;
    tint: string;
  };
  inputRefs: React.MutableRefObject<Map<string, TextInput>>;
  onInputFocusChange?: (focused: boolean) => void;
  onEmptyPress?: () => void;
};

type OutlineItemRowProps = {
  itemId: string;
  level: number;
  indentSize: number;
  colors: {
    text: string;
    icon: string;
    tint: string;
  };
  inputRefs: React.MutableRefObject<Map<string, TextInput>>;
  isDropTarget: boolean;
  drag: () => void;
  isActive: boolean;
  onInputFocusChange?: (focused: boolean) => void;
};

const OutlineItemRow = memo(function OutlineItemRow({
  itemId,
  level,
  indentSize,
  colors,
  inputRefs,
  isDropTarget,
  drag,
  isActive,
  onInputFocusChange,
}: OutlineItemRowProps) {
  const renderChildren = useCallback(
    (children: string[], nextDepth: number) => (
      <OutlineItemList
        items={children}
        level={nextDepth}
        indentSize={indentSize}
        colors={colors}
        inputRefs={inputRefs}
        onInputFocusChange={onInputFocusChange}
      />
    ),
    [colors, indentSize, inputRefs, onInputFocusChange],
  );

  return (
    <View
      style={[
        styles.itemBlock,
        isDropTarget && {
          borderBottomColor: colors.tint,
          borderBottomWidth: 2,
        },
      ]}
    >
      <OutlineItem
        item={itemId}
        depth={level}
        indentSize={indentSize}
        colors={colors}
        inputRefs={inputRefs}
        onDragStart={drag}
        isDragging={isActive}
        onInputFocusChange={onInputFocusChange}
        renderChildren={renderChildren}
      />
    </View>
  );
});

function OutlineItemList({
  items,
  level = 0,
  indentSize,
  colors,
  inputRefs,
  onInputFocusChange,
  onEmptyPress,
}: OutlineItemListProps) {
  const moveItemWithinParent = useOutlineStore(
    (state) => state.moveItemWithinParent,
  );
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  const keyExtractor = useCallback((item: string) => item, []);
  const isRootEmpty = level === 0 && items.length === 0;

  const renderItem = useCallback(
    ({ item, getIndex, drag, isActive }: RenderItemParams<string>) => {
      const index = getIndex() ?? 0;
      const isDropTarget =
        draggingItemId != null &&
        draggingItemId !== item &&
        targetIndex === index;

      return (
        <OutlineItemRow
          itemId={item}
          level={level}
          indentSize={indentSize}
          colors={colors}
          inputRefs={inputRefs}
          isDropTarget={isDropTarget}
          onInputFocusChange={onInputFocusChange}
          drag={() => {
            setDraggingItemId(item);
            setTargetIndex(index);
            drag();
          }}
          isActive={isActive}
        />
      );
    },
    [
      colors,
      draggingItemId,
      indentSize,
      inputRefs,
      level,
      onInputFocusChange,
      targetIndex,
    ],
  );

  return (
    <Pressable
      disabled={!(isRootEmpty && onEmptyPress)}
      onPress={onEmptyPress}
      style={isRootEmpty ? styles.emptyListPressArea : undefined}
    >
      {isRootEmpty ? (
        <Text style={[styles.emptyListHint, { color: colors.icon }]}>
          Tap anywhere to add a node
        </Text>
      ) : null}
      <DraggableFlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        autoscrollSpeed={120}
        autoscrollThreshold={64}
        activationDistance={1}
        onPlaceholderIndexChange={(nextIndex) => {
          setTargetIndex(nextIndex);
        }}
        onDragBegin={(index) => {
          setDraggingItemId(items[index] ?? null);
          setTargetIndex(index);
        }}
        onDragEnd={({ data, from, to }) => {
          setDraggingItemId(null);
          setTargetIndex(null);
          if (from === to) {
            return;
          }
          const movedId = data[to];
          if (!movedId) {
            return;
          }
          moveItemWithinParent(movedId, to);
        }}
        renderPlaceholder={() => (
          <View
            style={[
              styles.placeholder,
              { backgroundColor: `${colors.tint}22` },
            ]}
          />
        )}
        scrollEnabled={level === 0}
      />
    </Pressable>
  );
}

export default memo(OutlineItemList);

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  emptyListPressArea: {
    flex: 1,
  },
  emptyListHint: {
    textAlign: "center",
    paddingTop: 16,
    paddingHorizontal: 24,
    fontSize: 14,
  },
  itemBlock: {
    gap: 4,
    borderRadius: 8,
  },
  placeholder: {
    height: 36,
    borderRadius: 8,
    marginVertical: 2,
  },
});
