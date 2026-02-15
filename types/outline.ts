export type OutlineNode = {
  id: string;
  type: "text";
  text: string;
};

export type OutlineTreeNode = OutlineNode & {
  children?: OutlineTreeNode[];
};
