import { useCallback } from "react";
import {
  ElementRef,
  OverflowItem,
  OverflowHookProps,
  DynamicCollapseHookResult,
} from "./overflowTypes";
import { byDescendingPriority } from "./overflowUtils";
import {
  addAll,
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
  containerRef.current!.querySelector(UNCOLLAPSED_DYNAMIC_ITEMS) !== null;

const thereAreCollapsibleItemsAndTheyAreAllCollapsed = (
  items: OverflowItem[]
) => {
  const collapsibleItems = items.filter(isCollapsible);
  return collapsibleItems.length > 0 && collapsibleItems.every(isCollapsed);
};

const nextItemToCollapse = (listItems: OverflowItem[]): OverflowItem =>
  listItems.filter(isCollapsible).sort(byDescendingPriority).slice(-1)[0];

export const useDynamicCollapse = ({
  collectionHook,
  innerContainerSize = 0,
  label = "Toolbar",
  overflowItemsRef: managedItemsRef,
  overflowContainerRef: ref,
  orientation,
}: OverflowHookProps): DynamicCollapseHookResult => {
  const restoreCollapsingItem = useCallback(() => {
    collectionHook.dispatch({
      type: "restore-collapsing-item",
    });
  }, []);

  const collapseCollapsingItem = useCallback(
    (item: OverflowItem, target: HTMLElement, minSize: number) => {
      const styleDimension =
        orientation === "horizontal" ? "minWidth" : "minHeight";
      // TODO do we really want to do this here ?
      target.style[styleDimension] = `${minSize}px`;
      const size = measureElementSize(target);

      collectionHook.dispatch({
        type: "collapse-dynamic-item",
        overflowItem: item,
        collapsedSize: size,
        minSize,
      });
    },
    [orientation]
  );

  const checkDynamicContent = useCallback(
    (containerHasGrown) => {
      const { current: managedItems } = managedItemsRef;
      // The order must matter here
      const collapsingChild = managedItems.find(
        ({ collapsible, collapsing }) => collapsible === "dynamic" && collapsing
      );
      const collapsedChild = managedItems.find(
        ({ collapsible, collapsed }) => collapsible === "dynamic" && collapsed
      );

      if (!collapsingChild && !collapsedChild) {
        return;
      }
      if (collapsedChild && !collapsingChild) {
        // TODO do we need a check to see whether we now have enough space to completely uncollapse the item ?
        // We may be able to uncollapse one or more items before the one we set to collapsing

        collectionHook.dispatch({
          type: "uncollapse-dynamic-item",
          overflowItem: collapsedChild,
        });
      } else if (collapsingChild) {
        if (containerHasGrown && collapsedChild) {
          const collapsingElement = getElementForItem(ref, collapsingChild);
          const dimension = orientation === "horizontal" ? "width" : "height";
          // can we avoid measuring ths element on every resize event ?
          const { [dimension]: size } =
            collapsingElement.getBoundingClientRect();

          // We don't restore a collapsing item unless there is at least one collapsed item
          if (collapsedChild && size === collapsingChild.size) {
            restoreCollapsingItem();
          }
        } else {
          // Note we are going to compare width with minWidth. Margin is ignored
          // use getBoundingClientRect rather than measureNode
          const dimension = orientation === "horizontal" ? "width" : "height";
          const collapsingElement = getElementForItem(ref, collapsingChild);
          const { [dimension]: measuredSizeOfCollapsingElement } =
            collapsingElement.getBoundingClientRect();
          // minsize should be the size of the last item in the tooltray
          const [padStart, padEnd] = getRuntimePadding(
            collapsingElement,
            "left",
            "right"
          );
          //TODO we don't really want to measure the last item in the collapsing container
          // we want to measure the width of the item that will be the last to overflow.
          const lastTooltrayItem = collapsingElement.querySelector(
            ".Responsive-inner > :last-child"
          );
          if (lastTooltrayItem) {
            const { [dimension]: childMinSize } =
              lastTooltrayItem.getBoundingClientRect();
            const minSize = padStart + childMinSize + padEnd;
            if (Math.floor(measuredSizeOfCollapsingElement) <= minSize) {
              collapseCollapsingItem(
                collapsingChild,
                collapsingElement,
                minSize
              );
            }
          }
        }
      }
    },
    [collapseCollapsingItem]
  );

  const handleResize = useCallback(
    (size, containerHasGrown) => {
      const { current: managedItems } = managedItemsRef;
      const { isOverflowing: willOverflow } = measureContainerOverflow(
        ref,
        orientation
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
    [checkDynamicContent]
  );

  const resetMeasurements = useCallback(() => {
    const { current: managedItems } = managedItemsRef;
    const hasDynamicItems = hasUncollapsedDynamicItems(ref);
    if (hasDynamicItems) {
      const collapsingItem = nextItemToCollapse(managedItems);
      collectionHook.dispatch({
        type: "collapsing-item",
        overflowItem: collapsingItem,
      });
      return true;
    } else {
      return false;
    }
  }, []);

  return {
    onResize: handleResize,
    resetMeasurements,
  };
};
