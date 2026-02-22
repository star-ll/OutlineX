import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useBookStore } from "@/stores/book";

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
};

export default function IndexScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const createButtonBackgroundColor =
    colorScheme === "dark" ? "#ECEDEE" : colors.tint;
  const createButtonTextColor = colorScheme === "dark" ? "#151718" : "#FFFFFF";
  const books = useBookStore((state) => state.books);
  const hydrate = useBookStore((state) => state.hydrate);
  const refreshBooks = useBookStore((state) => state.refreshBooks);
  const createBook = useBookStore((state) => state.createBook);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  useFocusEffect(
    useCallback(() => {
      void refreshBooks();
    }, [refreshBooks]),
  );

  const handleCreateBook = useCallback(async () => {
    const nextName = `笔记 ${books.length + 1}`;
    const book = await createBook(nextName);
    router.push(`/book/${book.id}`);
  }, [books.length, createBook, router]);

  const handleOpenBook = useCallback(
    (bookId: string) => {
      router.push(`/book/${bookId}`);
    },
    [router],
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <ThemedText style={[styles.kicker, { color: colors.icon }]}>
            大纲笔记
          </ThemedText>
          {/* <ThemedText style={[styles.title, { color: colors.text }]}>我的文档</ThemedText> */}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={handleCreateBook}
          style={[
            styles.createButton,
            { backgroundColor: createButtonBackgroundColor },
          ]}
        >
          <ThemedText
            style={[styles.createButtonText, { color: createButtonTextColor }]}
          >
            新建
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {books.map((book) => (
          <Pressable
            key={book.id}
            accessibilityRole="button"
            onPress={() => handleOpenBook(book.id)}
            style={[
              styles.bookRow,
              {
                borderColor: `${colors.icon}22`,
                backgroundColor: colorScheme === "dark" ? "#1E2225" : "#FAFBFC",
              },
            ]}
          >
            <View style={[styles.dot, { borderColor: colors.icon }]} />
            <View style={styles.bookBody}>
              <ThemedText style={[styles.bookTitle, { color: colors.text }]}>
                {book.title}
              </ThemedText>
              <ThemedText style={[styles.bookMeta, { color: colors.icon }]}>
                最近编辑 {formatDate(book.updatedAt)}
              </ThemedText>
            </View>
            <ThemedText style={[styles.chevron, { color: colors.icon }]}>
              ›
            </ThemedText>
          </Pressable>
        ))}

        {books.length === 0 ? (
          <View style={[styles.empty, { borderColor: `${colors.icon}22` }]}>
            <ThemedText style={[styles.emptyText, { color: colors.icon }]}>
              还没有笔记，点击右上角新建一个。
            </ThemedText>
          </View>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  kicker: {
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.rounded,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  createButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 24,
    gap: 8,
  },
  bookRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    marginTop: 2,
  },
  bookBody: {
    flex: 1,
    gap: 2,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  bookMeta: {
    fontSize: 12,
  },
  chevron: {
    fontSize: 22,
    lineHeight: 22,
  },
  empty: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 13,
  },
});
