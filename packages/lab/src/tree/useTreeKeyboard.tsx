import { useContext } from "react";
import {
  ActiveIdContext,
  SetActiveIdContext,
  TreeContext,
} from "./Tree.Provider";
import type { TreeNode } from "./TreeNode";

function useTreeKeyboard() {
  const tree = useContext(TreeContext);
  const activeId = useContext(ActiveIdContext);
  const setActiveId = useContext(SetActiveIdContext);

  const flatTree = flattenTree(tree.current);

  console.log({ flatTree });
}

export function flattenTree(nodes: TreeNode.Record[]): TreeNode.Record[] {
  return nodes.reduce((acc, node) => {
    if (node.subnodes) {
      acc.push(...flattenTree(node.subnodes));

      return acc;
    }

    acc.push(node);

    return acc;
  }, [] as TreeNode.Record[]);
}
