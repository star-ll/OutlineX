import { Tabs } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
      edges={["top"]}
    >
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Outline",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="list.bullet.indent" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="debug"
          options={{
            href: __DEV__ ? undefined : null,
            title: "Debug",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="chevron.right" color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
