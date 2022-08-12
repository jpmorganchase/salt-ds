import { useCallback } from "react";
import { ElementRef, ManagedItem, overflowHookProps } from "./overflowTypes";
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
  items: ManagedItem[]
) => {
  const collapsibleItems = items.filter(isCollapsible);
  return collapsibleItems.length > 0 && collapsibleItems.every(isCollapsed);
};

const lastListItem = (
  listItems: ManagedItem[],
  filter?: (item: ManagedItem) => boolean
): ManagedItem =>
  filter
    ? lastListItem(listItems.filter(filter))
    : listItems[listItems.length - 1];

export const useDynamicCollapse = ({
  dispatchOverflowAction,
  innerContainerSize = 0,
  label = "Toolbar",
  managedItemsRef,
  ref,
  orientation,
}: overflowHookProps) => {
  const restoreCollapsingItem = useCallback(
    (collapsingItem: ManagedItem, collapsedItem: ManagedItem) => {
      console.log(
        `[useDynamicDispatch] restoreCollapsingItem, dispatch 'collapse' action - collapsing=false | collapsed=false, collapsing=true`
      );

      dispatchOverflowAction({
        type: "collapse",
        managedItems: [
          {
            ...collapsingItem,
            collapsing: false,
          },
          {
            ...collapsedItem,
            collapsed: false,
            collapsing: true,
          },
        ],
      });
    },
    []
  );

  const collapseCollapsingItem = useCallback(
    (item: ManagedItem, target: HTMLElement, minSize: number) => {
      const { current: managedItems } = managedItemsRef;
      const styleDimension =
        orientation === "horizontal" ? "minWidth" : "minHeight";
      // TODO do we really want to do this here ?
      target.style[styleDimension] = `${minSize}px`;
      const size = measureElementSize(target);
      const updates: ManagedItem[] = [
        {
          ...item,
          collapsing: false,
          collapsed: true,
          fullSize: item.size,
          minSize,
          size,
        },
      ];

      const rest = managedItems.filter(
        (i) => i.collapsible === "dynamic" && !i.collapsed && i !== item
      );
      const lastUncollapsedItem = rest.pop();
      if (lastUncollapsedItem) {
        updates.push({
          ...lastUncollapsedItem,
          collapsing: true,
        });
      }
      console.log(
        `[useDynamicDispatch] collapseCollapsingItem, dispatch 'collapse' action - collapsed=true, collapsing=false | [collapsing=true]`
      );

      dispatchOverflowAction({ type: "collapse", managedItems: updates });
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
        console.log(
          `[useDynamicDispatch] checkDynamicContent, dispatch 'collapse' action - collapsed=false, collaping=true`
        );
        dispatchOverflowAction({
          type: "collapse",
          managedItem: {
            ...collapsedChild,
            collapsed: false,
            collapsing: true,
            size: collapsedChild.fullSize as number,
            fullSize: null,
          },
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
            restoreCollapsingItem(collapsingChild, collapsedChild);
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

  const initializeDynamicContent = useCallback(() => {
    const { current: managedItems } = managedItemsRef;
    const renderedSize = managedItems.reduce(addAll, 0);

    let diff = renderedSize - innerContainerSize;
    for (let i = managedItems.length - 1; i >= 0; i--) {
      const item = managedItems[i];
      if (item.collapsible && !item.collapsed) {
        // TODO where do we derive min width 28 + 8
        if (diff > item.size - 36) {
          // We really want to know if it has reached min-width, but we will have to
          // wait for it to render
          // TODO
          item.collapsed = true;
          diff -= item.size;
        } else {
          item.collapsing = true;
          break;
        }
      }
    }
  }, [innerContainerSize]);

  const resetMeasurements = useCallback(
    (isOverflowing) => {
      const { current: managedItems } = managedItemsRef;
      const hasDynamicItems = hasUncollapsedDynamicItems(ref);
      if (hasDynamicItems) {
        if (isOverflowing) {
          initializeDynamicContent();
        } else {
          const collapsingItem = lastListItem(managedItems, isCollapsible);
          console.log(
            `[useDynamicDispatch] resetMeasurements, dispatch 'collapse' action - collaping=true`
          );
          dispatchOverflowAction({
            type: "collapse",
            managedItem: {
              ...collapsingItem,
              collapsing: true,
            },
          });
        }
      }
    },
    [initializeDynamicContent]
  );

  return {
    onResize: handleResize,
    resetMeasurements,
  };
};
