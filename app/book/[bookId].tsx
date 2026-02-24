import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import OutlineItemList from "@/components/outline/outline-item-list";
import OutlineKeyboardToolbar from "@/components/outline/outline-keyboard-toolbar";
import OutlineLoadingSkeleton from "@/components/outline/outline-loading-skeleton";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useBookStore } from "@/stores/book";
import { useOutlineStore } from "@/stores/outline";

const INDENT_SIZE = 18;
const itemEmpty: string[] = [];

export default function OutlineScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ bookId?: string }>();
  const bookId = Array.isArray(params.bookId)
    ? params.bookId[0]
    : params.bookId;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const inputRefs = useRef(new Map<string, TextInput>());
  const books = useBookStore((state) => state.books);
  const hydrateBooks = useBookStore((state) => state.hydrate);
  const renameBook = useBookStore((state) => state.renameBook);

  const items = useOutlineStore(
    (state) => state.childrenMap[state.rootId] || itemEmpty,
  );
  const activeId = useOutlineStore((state) => state.activeId);
  const addItemAfter = useOutlineStore((state) => state.addItemAfter);
  const indentItem = useOutlineStore((state) => state.indentItem);
  const outdentItem = useOutlineStore((state) => state.outdentItem);
  const collapseAll = useOutlineStore((state) => state.collapseAll);
  const expandAll = useOutlineStore((state) => state.expandAll);
  const loadBook = useOutlineStore((state) => state.loadBook);
  const dataMap = useOutlineStore((state) => state.dataMap);
  const childrenMap = useOutlineStore((state) => state.childrenMap);
  const collapsedIds = useOutlineStore((state) => state.collapsedIds);
  const currentBookTitle =
    books.find((book) => book.id === bookId)?.title ?? "未命名笔记";
  const [titleText, setTitleText] = useState(currentBookTitle);
  const [isOutlineInputFocused, setIsOutlineInputFocused] = useState(false);
  const [isOutlineLoading, setIsOutlineLoading] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!bookId) {
      setIsOutlineLoading(false);
      return;
    }
    setIsOutlineLoading(true);
    setIsOutlineInputFocused(false);
    void loadBook(bookId).finally(() => {
      if (cancelled) {
        return;
      }
      setIsOutlineLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [bookId, loadBook]);

  useEffect(() => {
    void hydrateBooks();
  }, [hydrateBooks]);

  useEffect(() => {
    setTitleText(currentBookTitle);
  }, [bookId, currentBookTitle]);

  useEffect(() => {
    if (!activeId) {
      return;
    }
    inputRefs.current.get(activeId)?.focus();

    // requestAnimationFrame(() => {
    //   inputRefs.current.get(activeId)?.focus();
    // });
  }, [activeId]);

  const handleToolbarAdd = useCallback(() => {
    if (activeId) {
      addItemAfter(activeId);
      return;
    }
    addItemAfter();
  }, [activeId, addItemAfter]);
  const handleEmptyOutlinePress = useCallback(() => {
    if (items.length > 0) {
      return;
    }
    addItemAfter();
  }, [addItemAfter, items.length]);

  const handleToolbarIndent = useCallback(() => {
    if (activeId) {
      indentItem(activeId);
    }
  }, [activeId, indentItem]);

  const handleToolbarOutdent = useCallback(() => {
    if (activeId) {
      outdentItem(activeId);
    }
  }, [activeId, outdentItem]);

  const handleSaveTitle = useCallback(async () => {
    if (!bookId) {
      return;
    }
    const normalizedTitle = titleText.trim();
    if (!normalizedTitle) {
      setTitleText(currentBookTitle);
      return;
    }
    if (normalizedTitle === currentBookTitle) {
      return;
    }
    await renameBook(bookId, normalizedTitle);
  }, [bookId, currentBookTitle, renameBook, titleText]);

  const handleShowStats = useCallback(() => {
    const totalNodes = Object.keys(dataMap).length;
    const rootNodes = items.length;
    const collapsedCount = Object.values(collapsedIds).filter(Boolean).length;
    let maxDepth = 0;
    const stack = rootNodes > 0 ? items.map((id) => ({ id, depth: 0 })) : [];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }
      maxDepth = Math.max(maxDepth, current.depth);
      const children = childrenMap[current.id] ?? [];
      for (const childId of children) {
        stack.push({ id: childId, depth: current.depth + 1 });
      }
    }

    const depthLevel = totalNodes === 0 ? 0 : maxDepth + 1;
    Alert.alert(
      "大纲统计",
      `节点总数：${totalNodes}\n一级节点：${rootNodes}\n最大层级：${depthLevel}\n已折叠节点：${collapsedCount}`,
    );
  }, [childrenMap, collapsedIds, dataMap, items]);

  const handlePressStats = useCallback(() => {
    setIsMenuVisible(false);
    handleShowStats();
  }, [handleShowStats]);

  const handlePressCollapseAll = useCallback(() => {
    collapseAll();
    setIsMenuVisible(false);
  }, [collapseAll]);

  const handlePressExpandAll = useCallback(() => {
    expandAll();
    setIsMenuVisible(false);
  }, [expandAll]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="打开大纲菜单"
          accessibilityHint="查看统计或进行折叠展开操作"
          onPress={() => setIsMenuVisible(true)}
          style={[styles.headerMenuButton]}
          hitSlop={8}
        >
          <IconSymbol name="line.3.horizontal" size={18} color={colors.icon} />
        </Pressable>
      ),
    });
  }, [colors.icon, navigation]);

  // const handleToolbarCollapse = useCallback(() => {
  //   if (!activeId) {
  //     return;
  //   }
  // }, [activeId, toggleCollapse]);

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {isOutlineLoading ? (
          <OutlineLoadingSkeleton iconColor={colors.icon} />
        ) : (
          <>
            <View style={styles.header}>
              <TextInput
                value={titleText}
                onChangeText={setTitleText}
                onFocus={() => setIsOutlineInputFocused(false)}
                onBlur={() => void handleSaveTitle()}
                onSubmitEditing={() => void handleSaveTitle()}
                placeholder="未命名笔记"
                placeholderTextColor={colors.icon}
                selectionColor={colors.tint}
                style={[
                  styles.title,
                  { fontFamily: Fonts.rounded, color: colors.text },
                ]}
              />
            </View>

            <OutlineItemList
              items={items}
              indentSize={INDENT_SIZE}
              colors={colors}
              inputRefs={inputRefs}
              onInputFocusChange={setIsOutlineInputFocused}
              onEmptyPress={handleEmptyOutlinePress}
            />
          </>
        )}
      </KeyboardAvoidingView>
      <Modal
        animationType="fade"
        transparent
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setIsMenuVisible(false)}
        >
          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: colorScheme === "dark" ? "#202427" : "#FFFFFF",
                borderColor: `${colors.icon}1F`,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="查看大纲统计"
              onPress={handlePressStats}
              style={styles.menuItem}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                统计信息
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="折叠全部节点"
              onPress={handlePressCollapseAll}
              style={styles.menuItem}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                全部折叠
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="展开全部节点"
              onPress={handlePressExpandAll}
              style={styles.menuItem}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                全部展开
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      <OutlineKeyboardToolbar
        visible={!isOutlineLoading && isOutlineInputFocused}
        onAdd={handleToolbarAdd}
        onIndent={handleToolbarIndent}
        onOutdent={handleToolbarOutdent}
        colors={{
          icon: colors.icon,
          tint: colors.tint,
          background: colors.background,
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0.5,
    paddingVertical: 2,
  },
  headerMenuButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    // borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 78,
    paddingHorizontal: 16,
  },
  menuCard: {
    borderWidth: 1,
    borderRadius: 12,
    minWidth: 160,
    overflow: "hidden",
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
