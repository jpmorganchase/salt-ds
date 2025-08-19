import { useIdMemo } from "@salt-ds/core";
import { useCallback, useRef } from "react";
import { partition } from "../utils";
import type {
  OverflowHookProps,
  OverflowHookResult,
  OverflowItem,
} from "./overflowTypes";
import {
  addAll,
  allExceptOverflowIndicator,
  getOverflowIndicator,
  isOverflowed,
  measureContainerOverflow,
  notOverflowed,
  popNextItemByPriority,
} from "./overflowUtils";

const NO_OVERFLOW_INDICATOR = { size: 0 };

const getPriority = (item: OverflowItem) => item.priority;

const popNextOverflowedItem = (items: OverflowItem[]) => {
  const minPriority = Math.min(...items.map(getPriority));
  for (let i = 0; i < items.length; i++) {
    if (!items[i].isOverflowIndicator && items[i].priority === minPriority) {
      return items.splice(i, 1)[0];
    }
  }
  return null;
};

export const useOverflow = ({
  collectionHook: { dispatch },
  id: idProp,
  label = "Toolbar",
  overflowItemsRef,
  overflowContainerRef,
  orientation,
}: OverflowHookProps): OverflowHookResult => {
  // We need to detect when we enter/exit the overflowed state
  const innerContainerSizeRef = useRef(0);
  const overflowIndicatorSize = useRef(0);
  const id = useIdMemo(idProp);

  const setContainerMinSize = useCallback(
    (size?: number) => {
      if (overflowContainerRef.current) {
        const isHorizontal = orientation === "horizontal";
        if (size === undefined) {
          const dimension = isHorizontal ? "width" : "height";
          ({ [dimension]: size } =
            overflowContainerRef.current.getBoundingClientRect());
        }
        if (typeof size === "number") {
          const styleDimension = isHorizontal ? "minWidth" : "minHeight";
          overflowContainerRef.current.style[styleDimension] = `${size}px`;
        }
      }
    },
    [orientation, overflowContainerRef],
  );

  const getAllOverflowedItems = useCallback(
    (renderedSize: number, availableSpace: number) => {
      const { current: allItems } = overflowItemsRef;
      const overflowedItems: OverflowItem[] = [];
      const items = allItems.slice();
      while (renderedSize > availableSpace) {
        const overflowedItem = popNextItemByPriority(items);
        if (overflowedItem === null) {
          break;
        }
        renderedSize -= overflowedItem.size;
        overflowedItems.push({
          ...overflowedItem,
          overflowed: true,
        });
      }
      return overflowedItems;
    },
    [overflowItemsRef],
  );

  const getOverflowedItems = useCallback(
    (visibleContentSize: number, containerSize: number) => {
      const newlyOverflowedItems = [];
      const { current: managedItems } = overflowItemsRef;
      const visibleItems = managedItems.filter(notOverflowed);
      while (visibleContentSize > containerSize) {
        const overflowedItem = popNextItemByPriority(visibleItems);
        if (overflowedItem === null) {
          // unable to overflow, all items are collapsed, this is our minimum width,
          // enforce it ...
          // TODO what if density changes
          // TODO probably not right, now we overflow even collapsed items, min width should be
          // overflow indicator width plus width of any non-overflowable items
          // setContainerMinSize(visibleContentSize);
          break;
        }
        visibleContentSize -= overflowedItem.size;
        newlyOverflowedItems.push({
          ...overflowedItem,
          overflowed: true,
        });
      }
      return newlyOverflowedItems;
    },
    [overflowItemsRef],
  );

  const getReinstatedItems = useCallback(
    (containerSize: number): [number, OverflowItem[]] => {
      const reinstatedItems: OverflowItem[] = [];
      const { current: managedItems } = overflowItemsRef;

      const [overflowedItems, visibleItems] = partition(
        managedItems,
        isOverflowed,
      );
      const overflowCount = overflowedItems.length;
      // TODO calculate this without using fullWidth if we have OVERFLOW
      // Need a loop here where we first remove OVERFLOW, then potentially remove
      // COLLAPSE too
      // We want to re-introduce overflowed items before we start to restore collapsed items
      // When we are dealing with overflowed items, we just use the current width of collapsed items.
      let visibleContentSize = visibleItems.reduce(
        allExceptOverflowIndicator,
        0,
      );
      let diff = containerSize - visibleContentSize;
      const { size: overflowSize = 0 } =
        getOverflowIndicator(managedItems) || NO_OVERFLOW_INDICATOR;
      const totalOverflowedSize = overflowedItems.reduce(
        (sum, item) => sum + item.size,
        0,
      );
      // It is important to make this check first, because the overflow indicator may have larger size than
      // individual overflowed item(s).
      if (totalOverflowedSize <= diff) {
        reinstatedItems.push(
          ...overflowedItems.map((item) => ({ ...item, overflowed: false })),
        );
      } else {
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
      }
      return [overflowCount, reinstatedItems];
    },
    [overflowItemsRef],
  );

  const resetMeasurements = useCallback(
    (isOverflowing: boolean, innerContainerSize: number) => {
      if (isOverflowing) {
        const { current: managedItems } = overflowItemsRef;
        const renderedSize = managedItems.reduce(allExceptOverflowIndicator, 0);
        const overflowIndicator = managedItems.find(
          (i) => i.isOverflowIndicator,
        );
        if (
          overflowIndicator &&
          overflowIndicator.size !== overflowIndicatorSize.current
        ) {
          overflowIndicatorSize.current = overflowIndicator.size;
          setContainerMinSize(overflowIndicator.size);
        }
        const existingOverflow = managedItems.filter(isOverflowed);
        const updates = getAllOverflowedItems(
          renderedSize,
          innerContainerSize - overflowIndicatorSize.current,
        );

        for (const item of existingOverflow) {
          if (!updates.some((i) => i.index === item.index)) {
            updates.push({
              ...item,
              overflowed: false,
            });
          }
        }

        const overflowAdded = !existingOverflow.length && updates.length;

        if (updates.length > 0) {
          if (overflowAdded) {
            dispatch({
              type: "update-items-add-overflow-indicator",
              overflowItems: updates,
              overflowItem: {
                fullSize: null,
                id: `${id}-overflow-indicator`,
                index: managedItems.length,
                isOverflowIndicator: true,
                label: "Overflow Menu",
                priority: 1,
                source: {},
              } as OverflowItem<"source">,
            });
          } else {
            dispatch({
              type: "update-items",
              overflowItems: updates,
            });
          }
          return true;
        }
        return false;
      }
    },
    [
      dispatch,
      getAllOverflowedItems,
      id,
      overflowItemsRef,
      setContainerMinSize,
    ],
  );

  const updateOverflow = useCallback(
    (containerSize: number, renderedSize: number) => {
      if (containerSize < renderedSize) {
        const overflowItems = getOverflowedItems(renderedSize, containerSize);
        if (overflowItems.length) {
          dispatch({
            type: "update-items",
            overflowItems,
          });
        }
      }
    },
    [dispatch, getOverflowedItems],
  );

  const removeOverflow = useCallback(
    (containerSize: number) => {
      const [overflowCount, reinstated] = getReinstatedItems(containerSize);
      if (reinstated.length) {
        if (overflowCount === reinstated.length) {
          dispatch({
            type: "update-items-remove-overflow-indicator",
            overflowItems: reinstated,
          });
        } else {
          dispatch({
            type: "update-items",
            overflowItems: reinstated,
          });
        }
      }
    },
    [dispatch, getReinstatedItems],
  );

  const handleResize = useCallback(
    (size: number, containerHasGrown?: boolean) => {
      const { current: managedItems } = overflowItemsRef;
      const wasOverflowing = managedItems.some(
        (item) => item.isOverflowIndicator,
      );
      const { isOverflowing } = measureContainerOverflow(
        overflowContainerRef,
        orientation,
      );

      innerContainerSizeRef.current = size;

      if (!wasOverflowing && isOverflowing) {
        // entering overflow
        // TODO if client is not using an overflow indicator, there is nothing to do here,
        // just let nature take its course. How do we know this ?
        // This is when we need to add width to measurements we are tracking
        resetMeasurements(true, size);
      } else if (wasOverflowing && containerHasGrown) {
        // check to see if we can reinstate one or more items, possibly all
        removeOverflow(size);
      } else if (wasOverflowing && isOverflowing) {
        // Note: container must have shrunk
        // still overflowing, possibly more overflowing than before
        const renderedSize = managedItems
          .filter(notOverflowed)
          .reduce(addAll, 0);
        updateOverflow(size, renderedSize);
      }
    },
    [
      orientation,
      overflowContainerRef,
      overflowItemsRef,
      removeOverflow,
      resetMeasurements,
      updateOverflow,
    ],
  );

  return {
    onResize: handleResize,
    resetMeasurements,
  };
};
