import React, { memo, useCallback, useEffect, useRef, useState } from "react";
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
    <View style={styles.itemBlock}>
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
  const activeId = useOutlineStore((state) => state.activeId);
  const listRef = useRef<GestureHandlerFlatList<string> | null>(null);
  const listViewportRef = useRef<View>(null);
  const scrollOffsetRef = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [listViewportHeight, setListViewportHeight] = useState(0);

  const keyExtractor = useCallback((item: string) => item, []);
  const isRootEmpty = level === 0 && items.length === 0;
  const isRootList = level === 0;

  useEffect(() => {
    if (!isRootList) {
      return;
    }
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
  }, [isRootList]);

  useEffect(() => {
    if (!isRootList || !activeId || listViewportHeight === 0) {
      return;
    }

    const activeInput = inputRefs.current.get(activeId);
    if (!activeInput) {
      return;
    }

    const timer = setTimeout(() => {
      activeInput.measureLayout(
        listViewportRef.current as never,
        (_x, y, _w, h) => {
          const reservedBottom =
            keyboardHeight > 0
              ? keyboardHeight + OUTLINE_KEYBOARD_TOOLBAR_HEIGHT
              : 0;
          const visibleBottom = Math.max(0, listViewportHeight - reservedBottom);
          const margin = 12;
          const rowTop = y;
          const rowBottom = y + h;

          let nextOffset = scrollOffsetRef.current;

          if (rowBottom + margin > visibleBottom) {
            nextOffset += rowBottom + margin - visibleBottom;
          } else if (rowTop - margin < 0) {
            nextOffset += rowTop - margin;
          }

          nextOffset = Math.max(0, nextOffset);

          if (Math.abs(nextOffset - scrollOffsetRef.current) > 1) {
            listRef.current?.scrollToOffset({ offset: nextOffset, animated: true });
          }
        },
        () => {},
      );
    }, 30);

    return () => clearTimeout(timer);
  }, [activeId, inputRefs, isRootList, keyboardHeight, listViewportHeight]);

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<string>) => {
      return (
        <OutlineItemRow
          itemId={item}
          level={level}
          indentSize={indentSize}
          colors={colors}
          inputRefs={inputRefs}
          onInputFocusChange={onInputFocusChange}
          drag={drag}
          isActive={isActive}
        />
      );
    },
    [colors, indentSize, inputRefs, level, onInputFocusChange],
  );

  return (
    <View
      ref={listViewportRef}
      style={isRootList ? styles.rootListPressArea : undefined}
      onLayout={
        isRootList
          ? (event) => setListViewportHeight(event.nativeEvent.layout.height)
          : undefined
      }
    >
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
          ref={isRootList ? listRef : undefined}
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            isRootList && keyboardHeight > 0
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
          onDragEnd={({ data, from, to }) => {
            if (from === to) {
              return;
            }
            const movedId = data[to];
            if (!movedId) {
              return;
            }
            moveItemWithinParent(movedId, to);
          }}
          onScrollOffsetChange={
            isRootList
              ? (offset) => {
                  scrollOffsetRef.current = offset;
                }
              : undefined
          }
          renderPlaceholder={() => (
            <View
              style={[
                styles.placeholder,
                { backgroundColor: `${colors.tint}22` },
              ]}
            />
          )}
          scrollEnabled={isRootList}
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
