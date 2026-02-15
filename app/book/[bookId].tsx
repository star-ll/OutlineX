import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import OutlineItemList from "@/components/outline/outline-item-list";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useBookStore } from "@/stores/book-store";
import { useOutlineStore } from "@/stores/outline-store";

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
    requestAnimationFrame(() => {
      inputRefs.current.get(activeId)?.focus();
    });
  }, [activeId]);

  const handleToolbarAdd = useCallback(() => {
    if (activeId) {
      addItemAfter(activeId);
      return;
    }
    addItemAfter();
  }, [activeId, addItemAfter]);

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
        <View style={styles.toolbar}>
          <Pressable
            accessibilityRole="button"
            onPress={handleToolbarAdd}
            style={[styles.toolbarButton, { borderColor: colors.tint }]}
          >
            <ThemedText style={[styles.toolbarText, { color: colors.tint }]}>
              Add
            </ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={handleToolbarIndent}
            style={[styles.toolbarButton, { borderColor: colors.icon }]}
          >
            <ThemedText style={[styles.toolbarText, { color: colors.icon }]}>
              Indent
            </ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={handleToolbarOutdent}
            style={[styles.toolbarButton, { borderColor: colors.icon }]}
          >
            <ThemedText style={[styles.toolbarText, { color: colors.icon }]}>
              Outdent
            </ThemedText>
          </Pressable>
          {/* <Pressable
            accessibilityRole="button"
            onPress={handleToolbarCollapse}
            style={[styles.toolbarButton, { borderColor: colors.icon }]}
          >
            <ThemedText style={[styles.toolbarText, { color: colors.icon }]}>
              Toggle
            </ThemedText>
          </Pressable> */}
        </View>
      </View>

      <OutlineItemList
        items={items}
        indentSize={INDENT_SIZE}
        colors={colors}
        inputRefs={inputRefs}
      />
      <View style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: colors.icon }]}>
          Enter to add, Tab to indent, Shift+Tab to outdent.
        </ThemedText>
      </View>
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
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  toolbarButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toolbarText: {
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    paddingBottom: 12,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 12,
  },
});
