import { ThemedView } from "@/components/themed-view";
import { Alert, Button, View } from "react-native";
import { useDebugStore } from "@/stores/debug";

export default function DebugScreen() {
  const clearing = useDebugStore((state) => state.clearing);
  const seedingLargeBook = useDebugStore((state) => state.seedingLargeBook);
  const clearDatabase = useDebugStore((state) => state.clearDatabase);
  const createLargeBook = useDebugStore((state) => state.createLargeBook);

  const handleClearDb = async () => {
    try {
      await clearDatabase();
      Alert.alert("完成", "数据库已清空");
    } catch (error) {
      console.error("Failed to clear database", error);
      Alert.alert("失败", "清空数据库失败，请重试");
    }
  };

  const handleCreateLargeBook = async () => {
    try {
      const book = await createLargeBook();
      Alert.alert("完成", `已创建 ${book.title}（10000 节点）`);
    } catch (error) {
      console.error("Failed to create large book", error);
      Alert.alert("失败", "创建 10000 节点笔记失败，请重试");
    }
  };

  return (
    <ThemedView>
      <View>
        <Button
          title={clearing ? "清空中..." : "清空数据库"}
          disabled={clearing || seedingLargeBook}
          onPress={handleClearDb}
        />
        <View style={{ height: 12 }} />
        <Button
          title={seedingLargeBook ? "创建中..." : "创建1w节点笔记"}
          disabled={clearing || seedingLargeBook}
          onPress={handleCreateLargeBook}
        />
      </View>
    </ThemedView>
  );
}
