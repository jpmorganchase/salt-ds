import { useCallback, useLayoutEffect, useMemo } from "react";
import { ManagedItem, overflowHookProps } from "./overflowTypes";
import {
  addAll,
  allExceptOverflowIndicator,
  getElementForItem,
  measureContainerOverflow,
  measureElementSize,
} from "./overflowUtils";

const newlyCollapsed = (visibleItems: ManagedItem[]) =>
  visibleItems.some(
    (item) =>
      item.collapsible === "instant" && item.collapsed && item.fullSize === null
  );

const findItemToCollapse = (items: ManagedItem[]) => {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item.collapsible === "instant" && !item.collapsed) {
      // We only ever collapse 1 item at a time. We don'tknow how much space
      //this has saved until it re-renders and we can re-measure
      return item;
    }
  }
};

const findItemsToUncollapse = (items: ManagedItem[], containerSize: number) => {
  let visibleContentSize = items.reduce(allExceptOverflowIndicator, 0);
  let diff = containerSize - visibleContentSize;

  const collapsed = items
    .filter((item) => item.collapsible === "instant" && item.collapsed)
    .sort((i1, i2) => i2.index - i1.index);
  // find the next collapsed item, see how much extra space it would
  // occupy if restored. If we have enough space, restore it.
  let result: ManagedItem[] = [];
  while (collapsed.length) {
    const item = collapsed.pop() as ManagedItem;
    const itemDiff = item.fullSize! - item.size;
    if (diff >= itemDiff) {
      result.push({
        ...item,
        collapsed: false,
        size: item.fullSize as number,
        fullSize: null,
      });
      diff = diff - itemDiff;
    } else {
      break;
    }
  }
  return result;
};

export const useInstantCollapse = ({
  dispatchOverflowAction,
  hasOverflowedItems,
  innerContainerSize = 0,
  label = "Toolbar",
  ref,
  managedItemsRef,
  orientation,
}: overflowHookProps) => {
  const minMaxSizes = useMemo(() => new Map(), []);

  const updateCollapse = useCallback(
    (containerSize, renderedSize) => {
      const { current: managedItems } = managedItemsRef;
      if (renderedSize && containerSize < renderedSize) {
        const managedItem = findItemToCollapse(managedItems);
        if (managedItem) {
          dispatchOverflowAction({
            type: "collapse",
            managedItem: {
              ...managedItem,
              collapsed: true,
            },
          });
        }
      } else {
        const collapsedItems = findItemsToUncollapse(
          managedItems,
          containerSize
        );
        if (collapsedItems.length) {
          dispatchOverflowAction({
            type: "uncollapse",
            managedItems: collapsedItems,
          });
        }
      }
    },
    [findItemsToUncollapse]
  );

  const handleResize = useCallback(
    (size, containerHasGrown) => {
      const { current: managedItems } = managedItemsRef;
      const { isOverflowing: willOverflow } = measureContainerOverflow(
        ref,
        orientation
      );

      const collapsedItems = managedItems.filter((item) => item.collapsed);

      if (willOverflow && !hasOverflowedItems) {
        const managedItem = findItemToCollapse(managedItems);
        if (managedItem) {
          dispatchOverflowAction({
            type: "collapse",
            managedItem: {
              ...managedItem,
              collapsed: true,
            },
          });
        }
      } else if (collapsedItems.length > 0 && containerHasGrown) {
        // Note: it must have been previously overflowing, too
        // check to see if we can reinstate one or more items
        updateCollapse(size, null);
      } else if (willOverflow && hasOverflowedItems) {
        // Note: container must have shrunk
        // still overflowing, possibly more overflowing than before
        const renderedSize = managedItems.reduce(addAll, 0);
        updateCollapse(size, renderedSize);
      }
    },
    [hasOverflowedItems, updateCollapse]
  );

  const resetMeasurements = useCallback(
    (isOverflowing) => {
      const { current: managedItems } = managedItemsRef;
      if (isOverflowing) {
        const managedItem = findItemToCollapse(managedItems);
        if (managedItem) {
          dispatchOverflowAction({
            type: "collapse",
            managedItem: {
              ...managedItem,
              collapsed: true,
            },
          });
        }
      }
    },
    [findItemToCollapse]
  );

  const setMinSize = useCallback((item, size) => {
    if (minMaxSizes.has(item.index)) {
      minMaxSizes.get(item.index).minSize = size;
    } else {
      minMaxSizes.set(item.index, { maxSize: null, minSize: size });
    }
  }, []);

  const measureCollapsedItem = useCallback(() => {
    const { current: managedItems } = managedItemsRef;
    const dimension = orientation === "horizontal" ? "width" : "height";
    const [collapsedItem] = managedItems.filter(
      (item) => item.collapsible === "instant" && item.collapsed
    );
    if (collapsedItem.fullSize === null) {
      const target = getElementForItem(ref, collapsedItem);
      if (target) {
        const collapsedSize = measureElementSize(target, dimension);
        const managedItem = findItemToCollapse(managedItems);
        const diff = collapsedItem.size - collapsedSize;
        const renderedSize = managedItems.reduce(addAll, 0) - diff;
        const updates = [];
        if (renderedSize > innerContainerSize && managedItem) {
          updates.push(
            {
              ...collapsedItem,
              fullSize: collapsedItem.size,
              size: collapsedSize,
            },
            {
              ...managedItem,
              collapsed: true,
            }
          );
        } else {
          updates.push({
            ...collapsedItem,
            fullSize: collapsedItem.size,
            size: collapsedSize,
          });
        }
        dispatchOverflowAction({ type: "collapse", managedItems: updates });
        setMinSize(collapsedItem, collapsedSize);
      }
    } else {
      return -1;
    }
  }, [innerContainerSize, orientation]);

  useLayoutEffect(() => {
    const { current: managedItems } = managedItemsRef;
    const newlyCollapsedItem = newlyCollapsed(managedItems);
    if (newlyCollapsedItem) {
      measureCollapsedItem();
    }
  }, [managedItemsRef.current, measureCollapsedItem]);

  return {
    onResize: handleResize,
    resetMeasurements,
  };
};
