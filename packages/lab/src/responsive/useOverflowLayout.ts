import { useCallback, useEffect, useRef } from "react";
import {
  type ResizeHandler,
  useResizeObserver,
} from "../responsive/useResizeObserver";
import type {
  ElementRef,
  ManagedListRef,
  OverflowItem,
  OverflowLayoutHookProps,
} from "./overflowTypes";
import { getIsOverflowed, measureContainerOverflow } from "./overflowUtils";
import { useDynamicCollapse } from "./useDynamicCollapse";
import { useInstantCollapse } from "./useInstantCollapse";
import { useOverflow } from "./useOverflow";
import { useReclaimSpace } from "./useReclaimSpace";

const MONITORED_DIMENSIONS: { [key: string]: string[] } = {
  horizontal: ["width", "scrollHeight"],
  vertical: ["height", "scrollWidth"],
  none: [],
};

type overflowUpdate = (item1: OverflowItem, item2: OverflowItem) => void;

// we need id, just to be able to assign id to overflowIndicator in useOverflow
export const useOverflowLayout = ({
  collectionHook,
  id,
  orientation,
  label = "Toolbar",
  disableOverflow = false,
}: OverflowLayoutHookProps): [ElementRef, overflowUpdate] => {
  const overflowContainerRef: ElementRef = useRef(null);
  const overflowItemsRef: ManagedListRef = useRef([]);
  const measurement = useRef({ innerContainerSize: 0, rootContainerDepth: 0 });
  const { innerContainerSize } = measurement.current;

  const { dispatch, version: collectionVersion } = collectionHook;
  overflowItemsRef.current = collectionHook.data;

  const {
    onResize: onOverflowResize,
    resetMeasurements: resetOverflowMeasurements,
  } = useOverflow({
    collectionHook,
    id,
    label,
    overflowItemsRef,
    orientation,
    overflowContainerRef,
  });

  const hasOverflowedItems = getIsOverflowed(collectionHook.data);
  // const hasOverflowedItems = getIsOverflowed(managedItems);

  const {
    onResize: onDynamicResize,
    resetMeasurements: resetDynamicMeasurements,
  } = useDynamicCollapse({
    collectionHook,
    innerContainerSize,
    label,
    overflowItemsRef,
    orientation,
    overflowContainerRef,
  });

  const {
    onResize: onInstantResize,
    resetMeasurements: resetInstantMeasurements,
  } = useInstantCollapse({
    collectionHook,
    hasOverflowedItems,
    innerContainerSize,
    label,
    overflowItemsRef,
    orientation,
    overflowContainerRef,
  });

  const { onResize: onReclaimResize } = useReclaimSpace({
    collectionHook,
    label,
    overflowItemsRef,
    orientation,
    overflowContainerRef,
  });

  const resizeHandler: ResizeHandler = useCallback(
    ({
      scrollHeight,
      height = scrollHeight,
      scrollWidth,
      width = scrollWidth,
    }) => {
      const size = orientation === "horizontal" ? width : height;
      if (typeof size === "number") {
        const { innerContainerSize } = measurement.current;
        const sizeDiff = size - innerContainerSize;
        // Tiny size diffs seem to be down to the relative sub-pixel innaccuracy of
        // ResizeObserver vs getBoundingClientRect
        if (Math.abs(sizeDiff) > 0.5) {
          measurement.current.innerContainerSize = size;
          const containerHasGrown = size > innerContainerSize;
          // Note: any one of these hooks may trigger a render which
          // may affect the overflow state that the next hook sees.
          // Hence, they all test for overflow internally and independently.
          onDynamicResize(size, containerHasGrown);
          onInstantResize(size, containerHasGrown);
          onOverflowResize(size, containerHasGrown);
          onReclaimResize(size, containerHasGrown);
        }
      }
    },
    [
      onDynamicResize,
      onInstantResize,
      onOverflowResize,
      onReclaimResize,
      orientation,
    ],
  );

  const measureAndInitialize = useCallback(() => {
    const { isOverflowing, ...contentWidthAndDepth } = measureContainerOverflow(
      overflowContainerRef,
      orientation,
    );

    measurement.current = contentWidthAndDepth;
    const { innerContainerSize } = contentWidthAndDepth;
    // TODO check this with complex combinations
    let handled = resetInstantMeasurements(isOverflowing);
    if (!handled) {
      handled = resetDynamicMeasurements();
      if (!handled) {
        resetOverflowMeasurements?.(isOverflowing, innerContainerSize);
      }
    }
  }, [
    orientation,
    resetInstantMeasurements,
    resetDynamicMeasurements,
    resetOverflowMeasurements,
  ]);

  const switchPriorities = useCallback(
    (item1: OverflowItem, item2: OverflowItem) => {
      const { priority: priority1 } = item1;
      const { priority: priority2 } = item2;
      if (priority1 !== priority2) {
        dispatch({
          type: "update-items",
          overflowItems: [
            { id: item1.id, priority: priority2 },
            { id: item2.id, priority: priority1 },
          ],
        });
        // Why do we need a timeout here when we don't inside resizeHandler ?
        setTimeout(measureAndInitialize, 0);
      }
    },
    [dispatch, measureAndInitialize],
  );

  // Important that we register our resize handler before we measure and
  // initialize. The initialization may trigger changes which we want the
  // resize observer to detect (when we have nested overflowables).
  useResizeObserver(
    overflowContainerRef,
    MONITORED_DIMENSIONS[disableOverflow ? "none" : orientation],
    resizeHandler,
  );

  // This hook runs after a measurememnt cycle, not after every single change to
  // collection data. The version attribute has been introduced specifically for this.
  useEffect(() => {
    if (!disableOverflow) {
      measureAndInitialize();
    }
  }, [collectionVersion, disableOverflow, measureAndInitialize]);

  return [overflowContainerRef, switchPriorities];
};
