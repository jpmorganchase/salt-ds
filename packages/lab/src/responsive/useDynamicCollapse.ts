import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useCallback, useState } from "react";
import type {
  DynamicCollapseHookResult,
  ElementRef,
  OverflowHookProps,
  OverflowItem,
} from "./overflowTypes";
import {
  byDescendingPriority,
  getElementForItem,
  getRuntimePadding,
  isCollapsed,
  isCollapsible,
  measureContainerOverflow,
  measureElementSize,
} from "./overflowUtils";

const UNCOLLAPSED_DYNAMIC_ITEMS =
  '[data-collapsible="dynamic"]:not([data-collapsed="true"]):not([data-collapsing="true"])';

const hasUncollapsedDynamicItems = (containerRef: ElementRef) =>
  containerRef.current?.querySelector(UNCOLLAPSED_DYNAMIC_ITEMS) !== null;

const thereAreCollapsibleItemsAndTheyAreAllCollapsed = (
  items: OverflowItem[],
) => {
  const collapsibleItems = items.filter(isCollapsible);
  return collapsibleItems.length > 0 && collapsibleItems.every(isCollapsed);
};

const nextItemToCollapse = (listItems: OverflowItem[]): OverflowItem =>
  listItems.filter(isCollapsible).sort(byDescendingPriority).slice(-1)[0];

export const useDynamicCollapse = ({
  collectionHook,
  overflowItemsRef: managedItemsRef,
  overflowContainerRef: ref,
  orientation,
}: OverflowHookProps): DynamicCollapseHookResult => {
  const { dispatch } = collectionHook;
  const [newCollapsingItem, setNewCollapsingItem] =
    useState<OverflowItem | null>(null);
  const restoreCollapsingItem = useCallback(() => {
    dispatch({
      type: "restore-collapsing-item",
    });
  }, [dispatch]);

  const collapseCollapsingItem = useCallback(
    (item: OverflowItem, target: HTMLElement, minSize: number) => {
      const styleDimension =
        orientation === "horizontal" ? "minWidth" : "minHeight";
      // TODO do we really want to do this here ?
      target.style[styleDimension] = `${minSize}px`;
      const size = measureElementSize(target);

      dispatch({
        type: "collapse-dynamic-item",
        overflowItem: item,
        collapsedSize: size,
        minSize,
      });
    },
    [dispatch, orientation],
  );

  const checkDynamicContent = useCallback(
    (containerHasGrown?: boolean) => {
      const { current: managedItems } = managedItemsRef;
      // The order must matter here
      const collapsingChild = managedItems.find(
        ({ collapsible, collapsing }) =>
          collapsible === "dynamic" && collapsing,
      );
      const collapsedChild = managedItems.find(
        ({ collapsible, collapsed }) => collapsible === "dynamic" && collapsed,
      );

      if (!collapsingChild && !collapsedChild) {
        return;
      }
      if (collapsedChild && !collapsingChild) {
        // TODO do we need a check to see whether we now have enough space to completely uncollapse the item ?
        // We may be able to uncollapse one or more items before the one we set to collapsing

        dispatch({
          type: "uncollapse-dynamic-item",
          overflowItem: collapsedChild,
        });
      } else if (collapsingChild) {
        if (containerHasGrown && collapsedChild) {
          const collapsingElement = getElementForItem(ref, collapsingChild);
          const dimension = orientation === "horizontal" ? "width" : "height";
          // can we avoid measuring ths element on every resize event ?
          if (collapsingElement) {
            const size = measureElementSize(collapsingElement, dimension);
            // collapsingElement.getBoundingClientRect();

            // We don't restore a collapsing item unless there is at least one collapsed item
            if (collapsedChild && size === collapsingChild.size) {
              restoreCollapsingItem();
            }
          }
        } else {
          // Note we are going to compare width with minWidth. Margin is ignored
          // use getBoundingClientRect rather than measureNode
          const dimension = orientation === "horizontal" ? "width" : "height";
          const collapsingElement = getElementForItem(ref, collapsingChild);

          if (!collapsingElement) return;

          const { [dimension]: measuredSizeOfCollapsingElement } =
            collapsingElement.getBoundingClientRect();
          // minsize should be the size of the last item in the tooltray
          const [padStart, padEnd] = getRuntimePadding(
            collapsingElement,
            "left",
            "right",
          );
          //TODO we don't really want to measure the last item in the collapsing container
          // we want to measure the width of the item that will be the last to overflow.
          const lastTooltrayItem = collapsingElement.querySelector(
            ".Responsive-inner > :last-child",
          );
          if (lastTooltrayItem) {
            const { [dimension]: childMinSize } =
              lastTooltrayItem.getBoundingClientRect();
            const minSize = padStart + childMinSize + padEnd;
            if (Math.floor(measuredSizeOfCollapsingElement) <= minSize) {
              collapseCollapsingItem(
                collapsingChild,
                collapsingElement,
                minSize,
              );
            }
          }
        }
      }
    },
    [
      collapseCollapsingItem,
      dispatch,
      managedItemsRef,
      orientation,
      ref,
      restoreCollapsingItem,
    ],
  );

  const handleResize = useCallback(
    (size: number, containerHasGrown?: boolean) => {
      const { current: managedItems } = managedItemsRef;
      const { isOverflowing: willOverflow } = measureContainerOverflow(
        ref,
        orientation,
      );

      const collapsingItem = managedItems.find((item) => item.collapsing);

      if (collapsingItem) {
        checkDynamicContent(containerHasGrown);
      } else if (
        containerHasGrown &&
        !willOverflow &&
        thereAreCollapsibleItemsAndTheyAreAllCollapsed(managedItems)
      ) {
        checkDynamicContent(true);
      }
    },
    [checkDynamicContent, managedItemsRef, orientation, ref],
  );

  const resetMeasurements = useCallback(() => {
    const { current: managedItems } = managedItemsRef;
    const hasDynamicItems = hasUncollapsedDynamicItems(ref);
    if (hasDynamicItems) {
      const collapsingItem = nextItemToCollapse(managedItems);
      setNewCollapsingItem(collapsingItem);

      dispatch({
        type: "collapsing-item",
        overflowItem: collapsingItem,
      });
      return true;
    }
    return false;
  }, [dispatch, managedItemsRef, ref]);

  useIsomorphicLayoutEffect(() => {
    if (newCollapsingItem) {
      checkDynamicContent(false);
    }
  }, [checkDynamicContent, newCollapsingItem]);

  return {
    onResize: handleResize,
    resetMeasurements,
  };
};
