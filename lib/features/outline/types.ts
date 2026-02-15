import { OutlineNode } from "@/types/outline";

export type OutlineBook = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};

export type OutlineMaps = {
  childrenMap: Record<string, string[]>;
  parentMap: Record<string, string>;
  dataMap: Record<string, OutlineNode>;
};
