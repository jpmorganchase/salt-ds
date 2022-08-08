import { useCallback } from "react";
import {
  OverflowItem,
  OverflowHookProps,
  OverflowHookResult,
} from "./overflowTypes";

import {
  getOverflowIndicator,
  measureContainerOverflow,
  popNextItemByPriority,
} from "./overflowUtils";

const getPriority = (item: OverflowItem) => item.priority;

const canReclaimSpace = (item: OverflowItem) =>
  item.collapsed && item.reclaimSpace;

const hasReclaimedSpace = (item: OverflowItem) => item.reclaimedSpace;
const getReclaimableSpace = ({ size, minSize = 0 }: OverflowItem) =>
  size - minSize;

const findNextOverflowedItem = (items: OverflowItem[]) => {
  const overflowedItems = items.filter((item) => item.overflowed);
  const minPriority = Math.min(...overflowedItems.map(getPriority));
  for (let i = 0; i < overflowedItems.length; i++) {
    if (overflowedItems[i].priority === minPriority) {
      return overflowedItems[i];
    }
  }
  return null;
};

export const addAllVisible = (sum: number, m: OverflowItem) =>
  sum + (m.overflowed ? 0 : m.size);

const canReleaseReclaimedSpace = (size: number, items: OverflowItem[]) => {
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

const mightBeAbleToReclaimSpace = (items: OverflowItem[]) =>
  items.some(canReclaimSpace);

// We need to release the reclaimed space (i.e take it back from the collapsed item and re-assign it
// as available space) when container grows and space now allows overflowed item to be 'un-wrapped'

export const useReclaimSpace = ({
  collectionHook,
  label = "Toolbar",
  overflowItemsRef: managedItemsRef,
  overflowContainerRef: ref,
  orientation,
}: OverflowHookProps): OverflowHookResult => {
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

    const claimant = managedItems.find(hasReclaimedSpace);
    if (claimant) {
      // Might not always need to collapse, if there is enough available space for it to still be collapsing
      // collapse the claimant and turn off recvlaimed
      collectionHook.dispatch({
        type: "replace-item",
        overflowItem: {
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
    const { isOverflowing: willOverflow } = measureContainerOverflow(
      ref,
      orientation
    );
    const { current: managedItems } = managedItemsRef;

    if (containerHasGrown && canReleaseReclaimedSpace(size, managedItems)) {
      releaseReclaimedSpace();
    } else if (
      !containerHasGrown &&
      willOverflow &&
      mightBeAbleToReclaimSpace(managedItems)
    ) {
      const collapsedChild = managedItems.find(canReclaimSpace);
      if (collapsedChild) {
        collectionHook.dispatch({
          type: "replace-item",
          overflowItem: {
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
