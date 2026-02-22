import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Alert, Button, View } from "react-native";
import { useDebugStore } from "@/stores/debug";
import { useThemeStore } from "@/stores/theme";

export default function DebugScreen() {
  const clearing = useDebugStore((state) => state.clearing);
  const seedingLargeBook = useDebugStore((state) => state.seedingLargeBook);
  const clearDatabase = useDebugStore((state) => state.clearDatabase);
  const createLargeBook = useDebugStore((state) => state.createLargeBook);
  const mode = useThemeStore((state) => state.mode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
  const darkModeEnabled = mode === "dark";

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
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <View>
        <ThemedText>
          当前暗黑模式：{darkModeEnabled ? "开启" : "关闭（跟随系统）"}
        </ThemedText>
        <View style={{ height: 12 }} />
        <Button
          title={darkModeEnabled ? "关闭暗黑模式" : "开启暗黑模式"}
          disabled={clearing || seedingLargeBook}
          onPress={toggleDarkMode}
        />
        <View style={{ height: 12 }} />
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
