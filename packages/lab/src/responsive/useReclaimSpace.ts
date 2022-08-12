import { useCallback } from "react";
import { itemToString } from "..";
import { ManagedItem, overflowHookProps } from "./overflowTypes";

import {
  getIsOverflowed,
  getOverflowIndicator,
  measureContainerOverflow,
  popNextItemByPriority,
} from "./overflowUtils";

const getPriority = (item: ManagedItem) => item.priority;

const canReclaimSpace = (item: ManagedItem) =>
  item.collapsed && item.reclaimSpace;

const hasReclaimedSpace = (item: ManagedItem) => item.reclaimedSpace;
const getReclaimableSpace = ({ size, minSize = 0 }: ManagedItem) =>
  size - minSize;

const findNextOverflowedItem = (items: ManagedItem[]) => {
  const overflowedItems = items.filter((item) => item.overflowed);
  const minPriority = Math.min(...overflowedItems.map(getPriority));
  for (let i = 0; i < overflowedItems.length; i++) {
    if (overflowedItems[i].priority === minPriority) {
      return overflowedItems[i];
    }
  }
  return null;
};

export const addAllVisible = (sum: number, m: ManagedItem) =>
  sum + (m.overflowed ? 0 : m.size);

const canReleaseReclaimedSpace = (size: number, items: ManagedItem[]) => {
  const claimant = items.find(hasReclaimedSpace);
  const overflowedItem = findNextOverflowedItem(items);
  if (claimant && overflowedItem) {
    const renderedSize = items.reduce(addAllVisible, 0);
    const { size: indicatorSize } = getOverflowIndicator(items)!;
    const { size: overflowedSize } = overflowedItem;
    // TODO we can discount the indicator size ONLY IF overflowed item is only overflowed item
    const reclaimableSpace = getReclaimableSpace(claimant);
    const renderedSizeAfterReclaim =
      renderedSize - reclaimableSpace - indicatorSize;
    const maxAvailableSpace = size - renderedSizeAfterReclaim;
    if (maxAvailableSpace >= overflowedSize) {
      return true;
    }
  }
};

const mightBeAbleToReclaimSpace = (items: ManagedItem[]) =>
  items.some(canReclaimSpace);

// We need to release the reclaimed space (i.e take it back from the collapsed item and re-assign it
// as available space) when container grows and space now allows overflowed item to be 'un-wrapped'

export const useReclaimSpace = ({
  dispatchOverflowAction,
  label = "Toolbar",
  managedItemsRef,
  ref,
  orientation,
}: overflowHookProps) => {
  const getAllOverflowedItems = useCallback(
    (visibleContentSize, containerSize) => {
      let newlyOverflowedItems = [];
      const { current: managedItems } = managedItemsRef;
      const visibleItems = managedItems.slice();
      while (visibleContentSize > containerSize) {
        const overflowedItem = popNextItemByPriority(visibleItems);
        if (overflowedItem === null) {
          break;
        }
        // eslint-disable-next-line no-param-reassign
        visibleContentSize -= overflowedItem.size;
        newlyOverflowedItems.push(overflowedItem);
      }
      return newlyOverflowedItems;
    },
    []
  );

  const releaseReclaimedSpace = useCallback(() => {
    const { current: managedItems } = managedItemsRef;
    console.log("[useReclaimSpace] releaseReclaimedSpace");

    const claimant = managedItems.find(hasReclaimedSpace);
    if (claimant) {
      // const claimantElement = getElementForItem(ref, claimant);
      const { minSize = 0 } = claimant;
      // Might not always need to collapse, if there is enough available space for it to still be collapsing
      // collapseCollapsingItem(claimant, claimantElement, minSize);
      // collapse the claimant and turn off recvlaimed
      dispatchOverflowAction({
        type: "collapse",
        managedItem: {
          ...claimant,
          collapsed: true,
          collapsing: false,
          reclaimedSpace: undefined,
          size: claimant.minSize as number,
          fullSize: claimant.size,
        },
      });
    }
  }, []);
  const handleResize = useCallback((size, containerHasGrown) => {
    console.log(`[useReclaimSpace] handleResize`);
    const { isOverflowing: willOverflow } = measureContainerOverflow(
      ref,
      orientation
    );
    const { current: managedItems } = managedItemsRef;
    const isOverflowing = getIsOverflowed(managedItems);

    if (containerHasGrown && canReleaseReclaimedSpace(size, managedItems)) {
      releaseReclaimedSpace();
      // updateOverflow(size, null);
    } else if (
      !containerHasGrown &&
      willOverflow &&
      mightBeAbleToReclaimSpace(managedItems)
    ) {
      const collapsedChild = managedItems.find(canReclaimSpace);
      if (collapsedChild) {
        console.log(`[useReclaimSpace] handleResize: reclaim space`);
        dispatchOverflowAction({
          type: "collapse",
          managedItem: {
            ...collapsedChild,
            collapsed: false,
            collapsing: true,
            reclaimedSpace: true,
            size: collapsedChild.fullSize as number,
            fullSize: null,
          },
        });
      }
    }
  }, []);

  return {
    onResize: handleResize,
  };
};
