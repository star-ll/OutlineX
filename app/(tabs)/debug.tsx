import { DEFAULT_BOOK_ID } from "@/constants/db";
import { useBookStore } from "@/stores/book-store";
import { useOutlineStore } from "@/stores/outline-store";
import { useState } from "react";
import { ThemedView } from "@/components/themed-view";
import { Alert, Button, View } from "react-native";

export default function DebugScreen() {
  const [clearing, setClearing] = useState(false);
  const clearAllBooks = useBookStore((state) => state.clearAllBooks);
  const loadBook = useOutlineStore((state) => state.loadBook);

  const handleClearDb = async () => {
    try {
      setClearing(true);
      await clearAllBooks();
      await loadBook(DEFAULT_BOOK_ID);
      Alert.alert("完成", "数据库已清空");
    } catch (error) {
      console.error("Failed to clear database", error);
      Alert.alert("失败", "清空数据库失败，请重试");
    } finally {
      setClearing(false);
    }
  };

  return (
    <ThemedView>
      <View>
        <Button
          title={clearing ? "清空中..." : "清空数据库"}
          disabled={clearing}
          onPress={handleClearDb}
        />
      </View>
    </ThemedView>
  );
}
