import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import OutlineItemList from "@/components/outline/outline-item-list";
import OutlineKeyboardToolbar from "@/components/outline/outline-keyboard-toolbar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useBookStore } from "@/stores/book";
import { useOutlineStore } from "@/stores/outline";

const INDENT_SIZE = 18;
const itemEmpty: string[] = [];

export default function OutlineScreen() {
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
  const loadBook = useOutlineStore((state) => state.loadBook);
  const currentBookTitle =
    books.find((book) => book.id === bookId)?.title ?? "未命名笔记";
  const [titleText, setTitleText] = useState(currentBookTitle);
  const [isOutlineInputFocused, setIsOutlineInputFocused] = useState(false);

  useEffect(() => {
    if (!bookId) {
      return;
    }
    void loadBook(bookId);
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

  // const handleToolbarCollapse = useCallback(() => {
  //   if (!activeId) {
  //     return;
  //   }
  // }, [activeId, toggleCollapse]);

  return (
    <ThemedView style={styles.container}>
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
      <View style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: colors.icon }]}>
          Enter to add, Tab to indent, Shift+Tab to outdent.
        </ThemedText>
      </View>
      <OutlineKeyboardToolbar
        visible={isOutlineInputFocused}
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
  footer: {
    paddingBottom: 12,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 12,
  },
});
