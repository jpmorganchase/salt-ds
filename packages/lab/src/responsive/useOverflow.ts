import { useCallback, useLayoutEffect, useRef } from "react";
import {
  addAll,
  allExceptOverflowIndicator,
  getIsOverflowed,
  getOverflowIndicator,
  isOverflowed,
  measureContainerOverflow,
  measureElementSize,
  notOverflowed,
  NO_DATA,
  popNextItemByPriority,
} from "./overflowUtils";
import { ManagedItem, overflowHookProps } from "./overflowTypes";
import { partition } from "../utils";

const NO_OVERFLOW_INDICATOR = { size: 0 };

const getPriority = (item: ManagedItem) => item.priority;

const popNextOverflowedItem = (items: ManagedItem[]) => {
  const minPriority = Math.min(...items.map(getPriority));
  for (let i = 0; i < items.length; i++) {
    if (!items[i].isOverflowIndicator && items[i].priority === minPriority) {
      return items.splice(i, 1)[0];
    }
  }
  return null;
};

export const useOverflow = ({
  dispatchOverflowAction,
  label = "Toolbar",
  managedItemsRef,
  ref,
  orientation,
}: overflowHookProps) => {
  // We need to detect when we enter/exit the overflowed state
  const overflowed = useRef(false);
  const innerContainerSizeRef = useRef(0);
  const overflowIndicatorSize = useRef(36);

  const setContainerMinSize = useCallback(
    (size?: number) => {
      const isHorizontal = orientation === "horizontal";
      if (size === undefined) {
        const dimension = isHorizontal ? "width" : "height";
        // eslint-disable-next-line no-param-reassign
        ({ [dimension]: size } = ref.current!.getBoundingClientRect());
      }
      const styleDimension = isHorizontal ? "minWidth" : "minHeight";
      ref.current!.style[styleDimension] = `${size}px`;
    },
    [orientation]
  );

  const getAllOverflowedItems = useCallback(
    (visibleContentSize, containerSize) => {
      let newlyOverflowedItems = [];
      const { current: managedItems } = managedItemsRef;
      const visibleItems = managedItems.slice();
      while (visibleContentSize > containerSize) {
        const overflowedItem = popNextItemByPriority(visibleItems);
        if (overflowedItem === null) {
          // unable to overflow, all items are collapsed, this is our minimum width,
          // enforce it ...
          // TODO what if density changes
          // TODO probably not right, now we overflow even collapsed items, min width should be
          // overflow indicator width plus width of any non-overflowable items
          setContainerMinSize(visibleContentSize);
          break;
        }
        // eslint-disable-next-line no-param-reassign
        visibleContentSize -= overflowedItem.size;
        newlyOverflowedItems.push({
          ...overflowedItem,
          overflowed: true,
        });
      }
      return newlyOverflowedItems;
    },
    [setContainerMinSize]
  );

  const getOverflowedItems = useCallback(
    (visibleContentSize, containerSize) => {
      let newlyOverflowedItems = [];
      const { current: managedItems } = managedItemsRef;
      const visibleItems = managedItems.filter(notOverflowed);
      while (visibleContentSize > containerSize) {
        const overflowedItem = popNextItemByPriority(visibleItems);
        if (overflowedItem === null) {
          // unable to overflow, all items are collapsed, this is our minimum width,
          // enforce it ...
          // TODO what if density changes
          // TODO probably not right, now we overflow even collapsed items, min width should be
          // overflow indicator width plus width of any non-overflowable items
          setContainerMinSize(visibleContentSize);
          break;
        }
        // eslint-disable-next-line no-param-reassign
        visibleContentSize -= overflowedItem.size;
        newlyOverflowedItems.push({
          ...overflowedItem,
          overflowed: true,
        });
      }
      return newlyOverflowedItems;
    },
    [setContainerMinSize]
  );

  // recalculate overflowed items
  const resetOverflowedItems = useCallback(
    (containerSize) => {
      const { current: managedItems } = managedItemsRef;
      let visibleContentSize = managedItems.reduce(
        allExceptOverflowIndicator,
        0
      );

      let updatedItems: ManagedItem[] = [];
      const overflowedItems = managedItems.filter(isOverflowed);
      const allItems = managedItems.slice();
      while (visibleContentSize > containerSize) {
        const overflowedItem = popNextItemByPriority(allItems);
        if (overflowedItem === null) {
          // unable to overflow, all items are collapsed, this is our minimum width,
          // enforce it ...
          // TODO what if density changes
          // TODO probably not right, now we overflow even collapsed items, min width should be
          // overflow indicator width plus width of any non-overflowable items
          setContainerMinSize(visibleContentSize);
          break;
        }
        // eslint-disable-next-line no-param-reassign
        visibleContentSize -= overflowedItem.size;
        // If this item was already overflowed, no update needed
        const index = overflowedItems.findIndex(
          (i) => i.index === overflowedItem.index
        );
        if (index !== -1) {
          overflowedItems.splice(index, 1);
        } else {
          updatedItems.push({
            ...overflowedItem,
            overflowed: true,
          });
        }
      }
      return updatedItems;
    },
    [setContainerMinSize]
  );

  const getReinstatedItems = useCallback((containerSize) => {
    let reinstatedItems: ManagedItem[] = [];
    const { current: managedItems } = managedItemsRef;

    const [overflowedItems, visibleItems] = partition(
      managedItems,
      isOverflowed
    );
    // TODO calculate this without using fullWidth if we have OVERFLOW
    // Need a loop here where we first remove OVERFLOW, then potentially remove
    // COLLAPSE too
    // We want to re-introduce overflowed items before we start to restore collapsed items
    // When we are dealing with overflowed items, we just use the current width of collapsed items.
    let visibleContentSize = visibleItems.reduce(allExceptOverflowIndicator, 0);
    let diff = containerSize - visibleContentSize;
    const { size: overflowSize = 0 } =
      getOverflowIndicator(managedItems) || NO_OVERFLOW_INDICATOR;

    while (overflowedItems.length > 0) {
      const nextItem = popNextOverflowedItem(overflowedItems);
      if (nextItem && diff >= nextItem.size) {
        // we have enough free space to reinstate this overflowed item
        // we can only ignore the width of overflow Indicator if either there is only one remaining
        // overflow item (so overflowIndicator will be removed) or diff is big enough to accommodate
        // the overflow Ind.
        if (
          overflowedItems.length === 0 ||
          diff >= nextItem.size + overflowSize
        ) {
          visibleContentSize += nextItem.size;
          diff = diff - nextItem.size;
          reinstatedItems.push({
            ...nextItem,
            overflowed: false,
          });
        } else {
          break;
        }
      } else {
        break;
      }
    }
    return reinstatedItems;
  }, []);

  const resetMeasurements = useCallback(
    (isOverflowing, innerContainerSize) => {
      if (isOverflowing) {
        const { current: managedItems } = managedItemsRef;
        // We may already have an overflowIndicator here, if caller is Tabstrip
        const renderedSize = managedItems.reduce(allExceptOverflowIndicator, 0);
        const existingOverflow = managedItems.filter(isOverflowed);
        const updates = getAllOverflowedItems(
          renderedSize,
          innerContainerSize - overflowIndicatorSize.current
        );
        existingOverflow.forEach((item) => {
          if (!updates.some((i) => i.index === item.index)) {
            updates.push({
              ...item,
              overflowed: false,
            });
          }
        });
        if (updates.length > 0) {
          dispatchOverflowAction({
            type: "overflow",
            managedItems: updates,
          });
        }
      }
    },
    [getAllOverflowedItems]
  );

  const updateOverflow = useCallback(
    (containerSize, renderedSize) => {
      if (renderedSize && containerSize < renderedSize) {
        const overflowingItems = getOverflowedItems(
          renderedSize,
          containerSize
        );
        if (overflowingItems.length) {
          dispatchOverflowAction({
            type: "overflow",
            managedItems: overflowingItems,
          });
        }
      } else {
        const reinstatedItems = getReinstatedItems(containerSize);
        if (reinstatedItems.length) {
          dispatchOverflowAction({
            type: "overflow",
            managedItems: reinstatedItems,
          });
        }
      }
    },
    [getOverflowedItems, getReinstatedItems]
  );

  const handleResize = useCallback(
    (size, containerHasGrown) => {
      const { isOverflowing: willOverflow } = measureContainerOverflow(
        ref,
        orientation
      );
      const { current: managedItems } = managedItemsRef;
      const isOverflowing = getIsOverflowed(managedItems);
      innerContainerSizeRef.current = size;

      if (!isOverflowing && willOverflow) {
        // entering overflow
        // TODO if client is not using an overflow indicator, there is nothing to do here,
        // just let nature take its course. How do we know this ?
        // This is when we need to add width to measurements we are tracking
        resetMeasurements(true, size);
      } else if (isOverflowing && containerHasGrown) {
        // Note: it must have been previously overflowing, too
        // check to see if we can reinstate one or more items
        updateOverflow(size, null);
      } else if (isOverflowing && willOverflow) {
        // Note: container must have shrunk
        // still overflowing, possibly more overflowing than before
        const renderedSize = managedItems
          .filter(notOverflowed)
          .reduce(addAll, 0);
        updateOverflow(size, renderedSize);
      }
    },
    [resetMeasurements, updateOverflow]
  );

  const measureOverflowIndicator = useCallback(() => {
    const dimension = orientation === "horizontal" ? "width" : "height";
    const target: HTMLElement | null = ref.current!.querySelector(
      ':scope > [data-overflow-indicator="true"]'
    );
    if (target) {
      const { index, priority = "1" } = target?.dataset ?? NO_DATA;
      const overflowIndicator: ManagedItem = {
        fullSize: null,
        index: parseInt(index!, 10),
        isOverflowIndicator: true,
        priority: parseInt(priority, 10),
        size: measureElementSize(target, dimension),
      };
      if (overflowIndicator.size !== overflowIndicatorSize.current) {
        overflowIndicatorSize.current = overflowIndicator.size;
        const updatedItems = resetOverflowedItems(
          innerContainerSizeRef.current - overflowIndicatorSize.current
        );
        dispatchOverflowAction({
          type: "overflow",
          managedItems: updatedItems.concat(overflowIndicator),
        });
      } else {
        dispatchOverflowAction({
          type: "overflow",
          managedItem: overflowIndicator,
        });
      }
      // can we safely assume this is the minSize ?
      setContainerMinSize(overflowIndicator.size);
    }
  }, [setContainerMinSize]);

  const removeOverflowIndicator = useCallback(() => {
    const { current: managedItems } = managedItemsRef;
    const indicator = getOverflowIndicator(managedItems);
    dispatchOverflowAction({
      type: "remove",
      managedItem: indicator,
    });
  }, []);

  useLayoutEffect(() => {
    const { current: wasOverflowed } = overflowed;
    const { current: managedItems } = managedItemsRef;

    const isOverflowed = getIsOverflowed(managedItems);
    if (isOverflowed && !wasOverflowed) {
      overflowed.current = true;
      measureOverflowIndicator();
    } else if (wasOverflowed && !isOverflowed) {
      overflowed.current = false;
      removeOverflowIndicator();
    }
  }, [
    managedItemsRef.current,
    measureOverflowIndicator,
    removeOverflowIndicator,
  ]);

  return {
    onResize: handleResize,
    resetMeasurements,
  };
};
