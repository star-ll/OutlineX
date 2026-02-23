import React from "react";
import { StyleSheet, View } from "react-native";

type OutlineLoadingSkeletonProps = {
  iconColor: string;
};

export default function OutlineLoadingSkeleton({
  iconColor,
}: OutlineLoadingSkeletonProps) {
  return (
    <View style={styles.loadingContainer}>
      <View
        style={[styles.titleSkeleton, { backgroundColor: `${iconColor}24` }]}
      />
      <View style={styles.listSkeleton}>
        {Array.from({ length: 7 }).map((_, index) => (
          <View
            key={`skeleton-${index}`}
            style={[
              styles.listSkeletonRow,
              {
                width: `${92 - index * 8}%`,
                backgroundColor: `${iconColor}18`,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    paddingTop: 8,
  },
  titleSkeleton: {
    height: 42,
    width: "66%",
    borderRadius: 12,
    marginBottom: 18,
  },
  listSkeleton: {
    gap: 10,
    paddingLeft: 6,
    paddingRight: 18,
  },
  listSkeletonRow: {
    height: 22,
    borderRadius: 10,
  },
});
