import { OutlineTreeNode } from "@/types/outline";
import { uuidV7 } from "@/utils/uuid";

export function generateTestOutlineList() {
  return new Array(3).fill(1).map((_, i) => ({
    id: uuidV7(),
    type: "text",
    text: "标题" + i,
    children: new Array(30).fill(1).map((_, j) => ({
      id: uuidV7(),
      type: "text",
      text: "文本" + j,
    })),
  })) as OutlineTreeNode[];
}
