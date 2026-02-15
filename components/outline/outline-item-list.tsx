import React, { useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";

import OutlineItem from "@/components/outline/outline-item";

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

export default function OutlineItemList({
  items,
  level = 0,
  indentSize,
  colors,
  inputRefs,
}: OutlineItemListProps) {
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.listContent}
      renderItem={({ item, index }) => {
        const isDropTarget =
          draggingItemId != null &&
          draggingItemId !== item &&
          targetIndex === index;

        return (
          <View
            style={[
              styles.itemBlock,
              isDropTarget && { backgroundColor: `${colors.tint}22` },
            ]}
          >
            <OutlineItem
              item={item}
              siblingIndex={index}
              siblingCount={items.length}
              depth={level}
              indentSize={indentSize}
              colors={colors}
              inputRefs={inputRefs}
              onDragStateChange={(isDragging) => {
                if (isDragging) {
                  setDraggingItemId(item);
                  setTargetIndex(index);
                  return;
                }
                setDraggingItemId(null);
                setTargetIndex(null);
              }}
              onDragTargetChange={(nextIndex) => {
                setTargetIndex(nextIndex);
              }}
              renderChildren={(children, nextDepth) => (
                <OutlineItemList
                  items={children}
                  level={nextDepth}
                  indentSize={indentSize}
                  colors={colors}
                  inputRefs={inputRefs}
                />
              )}
            />
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  itemBlock: {
    gap: 4,
    borderRadius: 8,
  },
});
