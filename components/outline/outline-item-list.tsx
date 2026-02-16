import React, { memo, useCallback, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
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
}: OutlineItemRowProps) {
  const renderChildren = useCallback(
    (children: string[], nextDepth: number) => (
      <OutlineItemList
        items={children}
        level={nextDepth}
        indentSize={indentSize}
        colors={colors}
        inputRefs={inputRefs}
      />
    ),
    [colors, indentSize, inputRefs],
  );

  return (
    <View
      style={[
        styles.itemBlock,
        isDropTarget && { borderBottomColor: colors.tint, borderBottomWidth: 2 },
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
}: OutlineItemListProps) {
  const moveItemWithinParent = useOutlineStore((state) => state.moveItemWithinParent);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  const keyExtractor = useCallback((item: string) => item, []);

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
      targetIndex,
    ],
  );

  return (
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
        <View style={[styles.placeholder, { backgroundColor: `${colors.tint}22` }]} />
      )}
      scrollEnabled={level === 0}
    />
  );
}

export default memo(OutlineItemList);

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
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
