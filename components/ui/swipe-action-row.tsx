import React, { useCallback, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type PressableStateCallbackType,
  type ViewStyle,
} from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

import { ThemedText } from "@/components/themed-text";

type SwipeAction = {
  label: string;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

type SwipeActionRowProps = {
  children: React.ReactNode;
  action: SwipeAction;
  actionWidth?: number;
  containerStyle?: ViewStyle;
  enabled?: boolean;
};

export function SwipeActionRow({
  children,
  action,
  actionWidth = 92,
  containerStyle,
  enabled = true,
}: SwipeActionRowProps) {
  const swipeableRef = useRef<SwipeableMethods | null>(null);

  const handleActionPress = useCallback(() => {
    swipeableRef.current?.close();
    action.onPress();
  }, [action]);

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      enabled={enabled}
      overshootRight={false}
      rightThreshold={40}
      containerStyle={containerStyle}
      renderRightActions={() => (
        <View style={styles.rightActionContainer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel ?? action.label}
            accessibilityHint={action.accessibilityHint}
            onPress={handleActionPress}
            style={({ pressed }: PressableStateCallbackType) => [
              styles.actionButton,
              {
                width: actionWidth,
                backgroundColor: action.backgroundColor,
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            {action.icon ? <View style={styles.iconWrap}>{action.icon}</View> : null}
            <ThemedText
              style={[styles.actionText, { color: action.textColor }]}
              lightColor={action.textColor}
              darkColor={action.textColor}
            >
              {action.label}
            </ThemedText>
          </Pressable>
        </View>
      )}
    >
      {children}
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  rightActionContainer: {
    justifyContent: "center",
    paddingVertical: 2,
    paddingLeft: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: "#111111",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  iconWrap: {
    marginBottom: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
