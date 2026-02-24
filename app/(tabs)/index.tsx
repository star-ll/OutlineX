import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { AppToast } from "@/components/ui/app-toast";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { SwipeActionRow } from "@/components/ui/swipe-action-row";
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
  const deleteActionBackgroundColor =
    colorScheme === "dark" ? "#B94141" : "#D14B4B";
  const books = useBookStore((state) => state.books);
  const hasHydrated = useBookStore((state) => state.hasHydrated);
  const isLoading = useBookStore((state) => state.isLoading);
  const hydrate = useBookStore((state) => state.hydrate);
  const refreshBooks = useBookStore((state) => state.refreshBooks);
  const createBook = useBookStore((state) => state.createBook);
  const deleteBook = useBookStore((state) => state.deleteBook);
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

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
  const showSuccessToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const handleConfirmDeleteBook = useCallback(
    (bookId: string, title: string) => {
      Alert.alert("删除笔记", `确认删除“${title}”？`, [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingBookId(bookId);
              await deleteBook(bookId);
              showSuccessToast("删除成功");
            } catch (error) {
              console.error("Failed to delete book", error);
              Alert.alert("删除失败", "删除笔记失败，请重试");
            } finally {
              setDeletingBookId((current) =>
                current === bookId ? null : current,
              );
            }
          },
        },
      ]);
    },
    [deleteBook, showSuccessToast],
  );

  const showInitialLoading = !hasHydrated && isLoading;
  const showEmpty = hasHydrated && !isLoading && books.length === 0;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <ThemedText style={[styles.kicker, { color: colors.icon }]}>
            OutlineX
          </ThemedText>
          {/* <ThemedText style={[styles.title, { color: colors.text }]}>我的文档</ThemedText> */}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {showInitialLoading ? (
          <View
            style={[styles.loadingCard, { borderColor: `${colors.icon}22` }]}
          >
            <ActivityIndicator color={colors.tint} />
            <ThemedText style={[styles.loadingText, { color: colors.icon }]}>
              正在加载笔记...
            </ThemedText>
          </View>
        ) : null}

        {books.map((book) => (
          <SwipeActionRow
            key={book.id}
            enabled={deletingBookId !== book.id}
            action={{
              label: "删除",
              onPress: () => handleConfirmDeleteBook(book.id, book.title),
              backgroundColor: deleteActionBackgroundColor,
              textColor: "#FFFFFF",
              icon: (
                <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
              ),
              accessibilityLabel: `删除笔记：${book.title}`,
              accessibilityHint: "点击后会弹出确认对话框",
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`打开笔记：${book.title}`}
              accessibilityHint={`最近编辑时间 ${formatDate(book.updatedAt)}，点击进入详情`}
              disabled={deletingBookId === book.id}
              onPress={() => handleOpenBook(book.id)}
              style={[
                styles.bookRow,
                {
                  borderColor: `${colors.icon}22`,
                  backgroundColor:
                    colorScheme === "dark" ? "#1E2225" : "#FAFBFC",
                  opacity: deletingBookId === book.id ? 0.65 : 1,
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
          </SwipeActionRow>
        ))}

        {showEmpty ? (
          <View style={[styles.empty, { borderColor: `${colors.icon}22` }]}>
            <ThemedText style={[styles.emptyText, { color: colors.icon }]}>
              还没有笔记，点击右下角新建一个。
            </ThemedText>
          </View>
        ) : null}
      </ScrollView>

      <FloatingActionButton
        onPress={handleCreateBook}
        accessibilityLabel="新建笔记"
        accessibilityHint="创建一个新的大纲笔记并进入编辑"
        backgroundColor={createButtonBackgroundColor}
        iconColor={createButtonTextColor}
        style={styles.fabButton}
      />
      <AppToast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
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
  listContent: {
    paddingBottom: 96,
    gap: 8,
  },
  fabButton: {
    position: "absolute",
    right: 16,
    bottom: 24,
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
  loadingCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
  },
});
