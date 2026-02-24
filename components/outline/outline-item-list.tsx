import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DraggableFlatList, {
  type RenderItemParams,
} from "react-native-draggable-flatlist";
import type { FlatList as GestureHandlerFlatList } from "react-native-gesture-handler";

import { OUTLINE_KEYBOARD_TOOLBAR_HEIGHT } from "@/components/outline/constants";
import OutlineItem from "@/components/outline/outline-item";
import { useOutlineStore } from "@/stores/outline";

type OutlineItemListProps = {
  items: string[];
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

type VisibleRow = {
  id: string;
  depth: number;
  parentId: string;
};

type DropTarget = {
  parentId: string;
  index: number;
  depth: number;
};

type OutlineItemRowProps = {
  row: VisibleRow;
  indentSize: number;
  colors: {
    text: string;
    icon: string;
    tint: string;
  };
  inputRefs: React.MutableRefObject<Map<string, TextInput>>;
  drag: () => void;
  isActive: boolean;
  onInputFocusChange?: (focused: boolean) => void;
};

const OutlineItemRow = memo(function OutlineItemRow({
  row,
  indentSize,
  colors,
  inputRefs,
  drag,
  isActive,
  onInputFocusChange,
}: OutlineItemRowProps) {
  return (
    <View style={styles.itemBlock}>
      <OutlineItem
        item={row.id}
        depth={row.depth}
        indentSize={indentSize}
        colors={colors}
        inputRefs={inputRefs}
        onDragStart={drag}
        isDragging={isActive}
        onInputFocusChange={onInputFocusChange}
      />
    </View>
  );
});

function OutlineItemList({
  items,
  indentSize,
  colors,
  inputRefs,
  onInputFocusChange,
  onEmptyPress,
}: OutlineItemListProps) {
  const moveItem = useOutlineStore((state) => state.moveItem);
  const moveItemWithinParent = useOutlineStore(
    (state) => state.moveItemWithinParent,
  );
  const childrenMap = useOutlineStore((state) => state.childrenMap);
  const collapsedIds = useOutlineStore((state) => state.collapsedIds);

  const listRef = useRef<GestureHandlerFlatList<VisibleRow> | null>(null);
  const scrollOffsetRef = useRef(0);
  const releaseAppliedRef = useRef(false);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState<number | null>(null);

  const isRootEmpty = items.length === 0;

  const visibleRows = useMemo(() => {
    const rows: VisibleRow[] = [];

    const walk = (parentId: string, depth: number) => {
      const children = childrenMap[parentId] ?? [];
      for (const childId of children) {
        rows.push({ id: childId, depth, parentId });
        if (!collapsedIds[childId]) {
          walk(childId, depth + 1);
        }
      }
    };

    for (const rootId of items) {
      rows.push({ id: rootId, depth: 0, parentId: "root" });
      if (!collapsedIds[rootId]) {
        walk(rootId, 1);
      }
    }

    return rows;
  }, [childrenMap, collapsedIds, items]);

  const keyExtractor = useCallback((item: VisibleRow) => item.id, []);

  const resolveDropTarget = useCallback(
    (
      reordered: VisibleRow[],
      to: number,
      fromRow: VisibleRow,
    ): DropTarget | null => {
      const prevRow = to > 0 ? reordered[to - 1] : undefined;
      const nextRow = to < reordered.length - 1 ? reordered[to + 1] : undefined;

      const siblingTarget = (anchor: VisibleRow, before = false): DropTarget => {
        const parentId = anchor.parentId;
        const siblings = childrenMap[parentId] || [];
        const anchorIndex = siblings.findIndex((id) => id === anchor.id);
        const index =
          anchorIndex === -1
            ? siblings.length
            : before
              ? anchorIndex
              : anchorIndex + 1;

        return {
          parentId,
          index,
          depth: anchor.depth,
        };
      };

      if (prevRow && nextRow) {
        if (nextRow.parentId === prevRow.id) {
          const parentId = prevRow.id;
          const siblings = childrenMap[parentId] || [];
          const nextIndex = siblings.findIndex((id) => id === nextRow.id);
          return {
            parentId,
            index: nextIndex === -1 ? 0 : nextIndex,
            depth: prevRow.depth + 1,
          };
        }

        if (prevRow.parentId === nextRow.parentId) {
          return siblingTarget(prevRow);
        }

        return siblingTarget(nextRow, true);
      }

      if (prevRow) {
        return siblingTarget(prevRow);
      }

      if (nextRow) {
        return siblingTarget(nextRow, true);
      }

      return {
        parentId: fromRow.parentId,
        index: 0,
        depth: fromRow.depth,
      };
    },
    [childrenMap],
  );

  const applyDrop = useCallback(
    (from: number, to: number) => {
      if (from === to) {
        return;
      }

      const fromRow = visibleRows[from];
      if (!fromRow) {
        return;
      }

      const reordered = [...visibleRows];
      const [movedRow] = reordered.splice(from, 1);
      if (!movedRow) {
        return;
      }
      reordered.splice(to, 0, movedRow);

      const target = resolveDropTarget(reordered, to, fromRow);
      if (!target) {
        return;
      }

      if (target.parentId === fromRow.parentId) {
        moveItemWithinParent(fromRow.id, target.index);
      } else {
        moveItem(fromRow.id, target.parentId, target.index);
      }
    },
    [moveItem, moveItemWithinParent, resolveDropTarget, visibleRows],
  );

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<VisibleRow>) => {
      return (
        <OutlineItemRow
          row={item}
          indentSize={indentSize}
          colors={colors}
          inputRefs={inputRefs}
          onInputFocusChange={onInputFocusChange}
          drag={drag}
          isActive={isActive}
        />
      );
    },
    [colors, indentSize, inputRefs, onInputFocusChange],
  );

  const previewTarget = useMemo(() => {
    if (
      activeDragIndex == null ||
      placeholderIndex == null ||
      placeholderIndex < 0
    ) {
      return null;
    }

    const fromRow = visibleRows[activeDragIndex];
    if (!fromRow) {
      return null;
    }

    return resolveDropTarget(visibleRows, placeholderIndex, fromRow);
  }, [activeDragIndex, placeholderIndex, resolveDropTarget, visibleRows]);

  return (
    <View style={styles.rootListPressArea}>
      <Pressable
        disabled={!(isRootEmpty && onEmptyPress)}
        onPress={onEmptyPress}
        style={isRootEmpty ? styles.emptyListPressArea : undefined}
      >
        {isRootEmpty ? (
          <Text style={[styles.emptyListHint, { color: colors.icon }]}>点击任意位置添加节点</Text>
        ) : null}
        <DraggableFlatList
          ref={listRef}
          data={visibleRows}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            keyboardHeight > 0
              ? {
                  paddingBottom:
                    24 + keyboardHeight + OUTLINE_KEYBOARD_TOOLBAR_HEIGHT,
                }
              : undefined,
          ]}
          keyboardShouldPersistTaps="handled"
          autoscrollSpeed={120}
          autoscrollThreshold={64}
          activationDistance={1}
          onDragBegin={(index) => {
            releaseAppliedRef.current = false;
            setActiveDragIndex(index);
            setPlaceholderIndex(index);
          }}
          onPlaceholderIndexChange={(index) => {
            setPlaceholderIndex(index);
          }}
          onRelease={(from) => {
            const to = placeholderIndex;
            if (to == null || to < 0) {
              return;
            }
            applyDrop(from, to);
            releaseAppliedRef.current = true;
          }}
          onDragEnd={({ data, from, to }) => {
            if (!releaseAppliedRef.current) {
              // Fallback for edge cases where onRelease does not fire.
              applyDrop(from, to);
            }
            releaseAppliedRef.current = false;
            setActiveDragIndex(null);
            setPlaceholderIndex(null);
          }}
          onScrollOffsetChange={(offset) => {
            scrollOffsetRef.current = offset;
          }}
          renderPlaceholder={() => (
            <View
              style={[
                styles.placeholder,
                {
                  backgroundColor: `${colors.tint}22`,
                  borderColor: colors.tint,
                  borderWidth: 1,
                  marginLeft: 12 + (previewTarget?.depth ?? 0) * indentSize,
                },
              ]}
            />
          )}
          scrollEnabled
        />
      </Pressable>
    </View>
  );
}

export default memo(OutlineItemList);

const styles = StyleSheet.create({
  rootListPressArea: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 0,
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
