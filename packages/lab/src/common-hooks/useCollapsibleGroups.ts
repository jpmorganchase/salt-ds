import { useCallback } from "react";
import { ArrowLeft, ArrowRight, Enter } from "./key-code";
import { ListHandlers } from "./selectionTypes";
import { CollectionItem, CollectionHookResult } from "./collectionTypes";

const NO_HANDLERS = {};
const canToggleItem = (item: CollectionItem<unknown>) =>
  Array.isArray(item.childNodes);
// TODO how do we determine this and where does this function belong = in the collectionHook ?
const canSelectItem = (item: CollectionItem<unknown>) => true;

const toggleIconClicked = (el: HTMLElement) => {
  const closestToggle = el.closest(
    "[data-toggle],[aria-expanded]"
  ) as HTMLElement;
  return closestToggle.dataset.toggle === "true";
};

interface CollapsibleHookProps<Item> {
  collapsibleHeaders?: boolean;
  collectionHook: CollectionHookResult<Item>;
  highlightedIdx: number;
  onToggle?: (node: Item) => void;
}

interface CollapsibleHookResult<Item> {
  onClick?: ListHandlers["onClick"];
  onKeyDown?: ListHandlers["onKeyDown"];
}

export const useCollapsibleGroups = <Item>({
  collapsibleHeaders,
  collectionHook,
  highlightedIdx,
  onToggle,
}: CollapsibleHookProps<Item>): CollapsibleHookResult<Item> => {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === ArrowRight || e.key === Enter) {
        const item = collectionHook.data[highlightedIdx];
        if (item) {
          if (item.expanded === false && item.value) {
            e.preventDefault();
            collectionHook.expandGroupItem(item);
            onToggle?.(item.value);
          }
        }
      }

      if (e.key === ArrowLeft || e.key === Enter) {
        const item = collectionHook.data[highlightedIdx];
        if (item) {
          if (item.expanded && item.value) {
            e.preventDefault();
            collectionHook.collapseGroupItem(item);
            onToggle?.(item.value);
          }
        }
      }
    },
    [
      collectionHook.collapseGroupItem,
      collectionHook.data,
      collectionHook.expandGroupItem,
      highlightedIdx,
    ]
  );

  const handleClick = useCallback(
    (evt) => {
      console.log(`useCollapsibleGroups idx=${highlightedIdx}`);
      const item = collectionHook.data[highlightedIdx];
      if (
        item &&
        canToggleItem(item) &&
        (!canSelectItem(item) || toggleIconClicked(evt.target))
      ) {
        evt.stopPropagation();
        evt.preventDefault();
        if (item.expanded === false && item.value) {
          collectionHook.expandGroupItem(item);
          onToggle?.(item.value);
        } else if (item.expanded === true && item.value) {
          collectionHook.collapseGroupItem(item);
          onToggle?.(item.value);
        }
      }
    },
    [
      collectionHook.collapseGroupItem,
      collectionHook.data,
      collectionHook.expandGroupItem,
      highlightedIdx,
    ]
  );

  /**
   * These are List handlers, so we will not have reference to the actual node
   * element. We must rely on highlightedIdx to tell us which node is interactive.
   */
  const listHandlers = {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
  };

  return collapsibleHeaders ? listHandlers : NO_HANDLERS;
};
