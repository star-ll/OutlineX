import { clearAllBooksAndNodes, createBook, saveOutlineMaps } from "@/lib/features/outline";
import { OutlineNode } from "@/types/outline";
import { uuidV7 } from "@/utils/uuid";

const ROOT_ID = "root";
const LARGE_NOTE_NODE_COUNT = 10000;

function buildLargeOutlineMaps() {
  const dataMap: Record<string, OutlineNode> = {};
  const parentMap: Record<string, string> = {};
  const rootChildren: string[] = [];

  for (let i = 1; i <= LARGE_NOTE_NODE_COUNT; i += 1) {
    const id = uuidV7();
    dataMap[id] = {
      id,
      type: "text",
      text: `节点 ${i}`,
    };
    parentMap[id] = ROOT_ID;
    rootChildren.push(id);
  }

  const childrenMap: Record<string, string[]> = {
    [ROOT_ID]: rootChildren,
  };

  return { dataMap, parentMap, childrenMap };
}

export async function clearDebugDatabase() {
  await clearAllBooksAndNodes();
}

export async function createLargeDebugBook() {
  const now = new Date();
  const title = `压测笔记-${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
  const book = await createBook(title);

  const maps = buildLargeOutlineMaps();
  await saveOutlineMaps(book.id, maps);

  return { id: book.id, title: book.title };
}
