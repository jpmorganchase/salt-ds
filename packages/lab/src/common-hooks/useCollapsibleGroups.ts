import { type KeyboardEvent, type MouseEvent, useMemo } from "react";
import { useEventCallback } from "../utils/useEventCallback";
import type { CollectionHookResult, CollectionItem } from "./collectionTypes";
import { ArrowLeft, ArrowRight, Enter } from "./keyUtils";
import type { ListHandlers } from "./selectionTypes";

const NO_HANDLERS = {};
const canToggleItem = (item: CollectionItem<unknown>) =>
  Array.isArray(item.childNodes);
// TODO how do we determine this and where does this function belong = in the collectionHook ?
const canSelectItem = () => true;

const toggleIconClicked = (el: HTMLElement) => {
  const closestToggle = el.closest(
    "[data-toggle],[aria-expanded]",
  ) as HTMLElement;
  return closestToggle.dataset.toggle === "true";
};

interface CollapsibleHookProps<Item> {
  collapsibleHeaders?: boolean;
  collectionHook: CollectionHookResult<Item>;
  highlightedIdx: number;
  onToggle?: (node: Item) => void;
}

interface CollapsibleHookResult {
  onClick?: ListHandlers["onClick"];
  onKeyDown?: ListHandlers["onKeyDown"];
}

export const useCollapsibleGroups = <Item>({
  collapsibleHeaders,
  collectionHook,
  highlightedIdx,
  onToggle,
}: CollapsibleHookProps<Item>): CollapsibleHookResult => {
  const handleKeyDown = useEventCallback((e: KeyboardEvent) => {
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
  });

  const handleClick = useEventCallback((evt: MouseEvent<HTMLElement>) => {
    console.log(`useCollapsibleGroups idx=${highlightedIdx}`);
    const item = collectionHook.data[highlightedIdx];
    console.log(evt.target, evt.currentTarget);
    if (
      item &&
      canToggleItem(item) &&
      (!canSelectItem() || toggleIconClicked(evt.target as HTMLElement))
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
  });

  /**
   * These are List handlers, so we will not have reference to the actual node
   * element. We must rely on highlightedIdx to tell us which node is interactive.
   */
  const listHandlers = useMemo(
    () => ({
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    }),
    [handleClick, handleKeyDown],
  );

  return collapsibleHeaders ? listHandlers : NO_HANDLERS;
};
