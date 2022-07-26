import { KeyboardEvent, useCallback } from "react";
import { ArrowLeft } from "../common-hooks/key-code";
import { CollectionItem, CollectionHookResult } from "../common-hooks";

export const getNodeParentPath = ({ id }: CollectionItem<any>) => {
  let pos = id!.lastIndexOf("-");
  if (pos !== -1) {
    // using the built-in hierarchical id scheme
    // rootId-n-n.n
    const path = id!.slice(pos + 1);
    const steps = path.split(".");
    if (steps.length === 1) {
      return null;
    } else {
      steps.pop();
      return `${id!.slice(0, pos)}-${steps.join(".")}`;
    }
  } else if ((pos = id!.lastIndexOf("/")) !== -1) {
    // using a path scheme step/step/step
    return id!.slice(0, pos);
  }
};

interface TreeNavigationHookProps<Item> {
  collectionHook: CollectionHookResult<Item>;
  highlightedIdx: number;
  highlightItemAtIndex: (index: number) => void;
}

interface TreeNavigationHookResult {
  listHandlers: {
    onKeyDown: (evt: KeyboardEvent) => void;
  };
}

// we need a way to set highlightedIdx when selection changes
export const useKeyboardNavigation = <Item>({
  collectionHook,
  highlightedIdx,
  highlightItemAtIndex,
}: TreeNavigationHookProps<Item>): TreeNavigationHookResult => {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === ArrowLeft) {
        const node = collectionHook.data[highlightedIdx];
        const parentId = getNodeParentPath(node);
        if (parentId) {
          highlightItemAtIndex(
            collectionHook.data.findIndex((item) => item.id === parentId)
          );
        }
      }
    },
    [highlightedIdx, highlightItemAtIndex]
  );

  const listHandlers = {
    onKeyDown: handleKeyDown,
  };

  return {
    listHandlers,
  };
};
