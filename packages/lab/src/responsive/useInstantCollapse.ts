import { useIsomorphicLayoutEffect } from "@jpmorganchase/uitk-core";
import { useCallback, useMemo } from "react";
import {
  OverflowItem,
  OverflowHookProps,
  InstantCollapseHookResult,
} from "./overflowTypes";
import {
  addAll,
  allExceptOverflowIndicator,
  getElementForItem,
  measureContainerOverflow,
  measureElementSize,
} from "./overflowUtils";

type MinMaxSize = {
  maxSize: number | null;
  minSize: number | null;
};

const newlyCollapsed = (overflowItems: OverflowItem[]) =>
  overflowItems.some(
    (item) =>
      item.collapsible === "instant" && item.collapsed && item.fullSize === null
  );

const findItemToCollapse = (items: OverflowItem[]) => {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item.collapsible === "instant" && !item.collapsed) {
      // We only ever collapse 1 item at a time. We don'tknow how much space
      //this has saved until it re-renders and we can re-measure
      return item;
    }
  }
};

const uncollapseItems = (items: OverflowItem[], containerSize: number) => {
  const visibleContentSize = items.reduce(allExceptOverflowIndicator, 0);
  let diff = containerSize - visibleContentSize;

  const collapsed = items
    .filter((item) => item.collapsible === "instant" && item.collapsed)
    .sort((i1, i2) => i2.index - i1.index);
  // find the next collapsed item, see how much extra space it would
  // occupy if restored. If we have enough space, restore it.
  const result: OverflowItem[] = [];
  while (collapsed.length) {
    const item = collapsed.pop() as OverflowItem;
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
  collectionHook,
  hasOverflowedItems,
  innerContainerSize = 0,
  label = "Toolbar",
  overflowContainerRef: ref,
  overflowItemsRef,
  orientation,
}: OverflowHookProps): InstantCollapseHookResult => {
  const minMaxSizes = useMemo(() => new Map<number, MinMaxSize>(), []);
  const { dispatch } = collectionHook;

  const updateCollapse = useCallback(
    (containerSize, renderedSize) => {
      const { current: managedItems } = overflowItemsRef;
      if (renderedSize && containerSize < renderedSize) {
        const overflowItem = findItemToCollapse(managedItems);
        if (overflowItem) {
          dispatch({
            type: "collapse-instant-item",
            overflowItem,
          });
        }
      } else {
        const uncollapsedItems = uncollapseItems(managedItems, containerSize);
        if (uncollapsedItems.length) {
          dispatch({
            type: "update-items",
            overflowItems: uncollapsedItems,
          });
        }
      }
    },
    [dispatch, overflowItemsRef]
  );

  const handleResize = useCallback(
    (size, containerHasGrown) => {
      const { current: managedItems } = overflowItemsRef;
      const { isOverflowing: willOverflow } = measureContainerOverflow(
        ref,
        orientation
      );

      const collapsedItems = managedItems.filter((item) => item.collapsed);

      if (willOverflow && !hasOverflowedItems) {
        const overflowItem = findItemToCollapse(managedItems);
        if (overflowItem) {
          dispatch({
            type: "collapse-instant-item",
            overflowItem,
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
    [
      dispatch,
      hasOverflowedItems,
      orientation,
      overflowItemsRef,
      ref,
      updateCollapse,
    ]
  );

  const resetMeasurements = useCallback(
    (isOverflowing) => {
      const { current: managedItems } = overflowItemsRef;
      if (isOverflowing) {
        const overflowItem = findItemToCollapse(managedItems);
        if (overflowItem) {
          dispatch({
            type: "collapse-instant-item",
            overflowItem,
          });
          return true;
        } else {
          return false;
        }
      }
    },
    [dispatch, overflowItemsRef]
  );

  const setMinSize = useCallback(
    (item: OverflowItem, size: number) => {
      const minMaxSize = minMaxSizes.get(item.index);
      if (minMaxSize) {
        minMaxSize.minSize = size;
      } else {
        minMaxSizes.set(item.index, { maxSize: null, minSize: size });
      }
    },
    [minMaxSizes]
  );

  const measureCollapsedItem = useCallback(() => {
    const { current: managedItems } = overflowItemsRef;
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
        dispatch({
          type: "update-items",
          overflowItems: updates,
        });
        setMinSize(collapsedItem, collapsedSize);
      }
    } else {
      return -1;
    }
  }, [
    dispatch,
    innerContainerSize,
    orientation,
    overflowItemsRef,
    ref,
    setMinSize,
  ]);

  useIsomorphicLayoutEffect(() => {
    const { current: managedItems } = overflowItemsRef;
    const newlyCollapsedItem = newlyCollapsed(managedItems);
    if (newlyCollapsedItem) {
      measureCollapsedItem();
    }
  }, [overflowItemsRef.current, measureCollapsedItem]);

  return {
    onResize: handleResize,
    resetMeasurements,
  };
};
