import { useCallback, useRef } from "react";
import { useLayoutEffectOnce } from "../utils/useLayoutEffectOnce";
import { useLayoutEffectSkipFirst } from "../utils/useLayoutEffectSkipFirst";
import {
  ElementRef,
  ManagedItem,
  ManagedListRef,
  orientationType,
  overflowDispatch,
} from "./overflowTypes";
import { getIsOverflowed, measureContainerOverflow } from "./overflowUtils";
import { useDynamicCollapse } from "./useDynamicCollapse";
import { useInstantCollapse } from "./useInstantCollapse";
import { useManagedItems } from "./useManagedItems";
import { useOverflow } from "./useOverflow";
import { useReclaimSpace } from "./useReclaimSpace";
import { useResizeObserver } from "./useResizeObserver";

const MONITORED_DIMENSIONS: { [key: string]: string[] } = {
  horizontal: ["width", "scrollHeight"],
  vertical: ["height", "scrollWidth"],
  none: [],
};

type overflowUpdate = (updates: ManagedItem[]) => void;

export const useOverflowLayout = (
  orientation: orientationType,
  label = "Toolbar"
): [ElementRef, ManagedItem[], overflowUpdate, overflowDispatch] => {
  const ref: ElementRef = useRef(null);
  const managedItemsRef: ManagedListRef = useRef([]);
  const measurement = useRef({ innerContainerSize: 0, rootContainerDepth: 0 });
  const { innerContainerSize } = measurement.current;

  const { dispatchOverflowAction, managedItems } = useManagedItems(
    ref,
    orientation
  );
  const managedItemCountRef = useRef(managedItems.length);
  managedItemsRef.current = managedItems;

  // console.groupCollapsed(
  //   `overflowLayout<${label}> ${managedItems.length} managed items`
  // );
  // console.log(JSON.stringify(managedItems, null, 2));
  // console.groupEnd();

  const overflowHook = useOverflow({
    dispatchOverflowAction,
    label,
    managedItemsRef,
    orientation,
    ref,
  });

  const hasOverflowedItems = getIsOverflowed(managedItems);

  const dynamicCollapseHook = useDynamicCollapse({
    dispatchOverflowAction,
    innerContainerSize,
    label,
    managedItemsRef,
    orientation,
    ref,
  });

  const instantCollapseHook = useInstantCollapse({
    dispatchOverflowAction,
    hasOverflowedItems,
    innerContainerSize,
    label,
    managedItemsRef,
    orientation,
    ref,
  });

  const reclaimSpaceHook = useReclaimSpace({
    dispatchOverflowAction,
    label,
    managedItemsRef,
    orientation,
    ref,
  });

  const resizeHandler = useCallback(
    ({
      scrollHeight,
      height = scrollHeight,
      scrollWidth,
      width = scrollWidth,
    }) => {
      const [size, depth] =
        orientation === "horizontal" ? [width, height] : [height, width];
      const { innerContainerSize, rootContainerDepth } = measurement.current;
      measurement.current.innerContainerSize = size;
      const containerHasGrown = size > innerContainerSize;

      // if (label === "Toolbar") {
      //   console.log(
      //     `%cuseOverflowLayout resizeHandler<${label}>\n\t%ccontainer grown\t${
      //       containerHasGrown ? "✓" : "✗"
      //     } (${innerContainerSize} - ${size})\n\tisOverflowing\t${
      //       hasOverflowedItems ? "✓" : "✗"
      //     }\n\twillOverflow\t${
      //       depth > rootContainerDepth ? "✓" : "✗"
      //     }\n\tcontainerDepth\t${depth}\n\tcontainerSize\t${size}`,
      //     `color:brown;font-weight: bold;`,
      //     `color:blue;`
      //   );
      // }
      // Note: any one of these hooks may trigger a render which
      // may affect the overflow state that the next hook sees.
      // Hence, they all test for overflow independently.
      dynamicCollapseHook.onResize(size, containerHasGrown);
      instantCollapseHook.onResize(size, containerHasGrown);
      overflowHook.onResize(size, containerHasGrown);
      reclaimSpaceHook.onResize(size, containerHasGrown);
    },
    [
      dynamicCollapseHook.onResize,
      instantCollapseHook.onResize,
      overflowHook.onResize,
      reclaimSpaceHook.onResize,
    ]
  );

  const measureAndInitialize = useCallback(() => {
    // console.log(
    //   `%cmeasureAndInitialize<${label}>`,
    //   "color:purple;font-weight:bold;"
    // );
    const { isOverflowing, ...contentWidthAndDepth } = measureContainerOverflow(
      ref,
      orientation
    );
    measurement.current = contentWidthAndDepth;

    const { innerContainerSize } = contentWidthAndDepth;
    // be careful, check this. can these trigger render which may change state of isOverflowing ?
    overflowHook.resetMeasurements(isOverflowing, innerContainerSize);
    instantCollapseHook.resetMeasurements(isOverflowing);
    dynamicCollapseHook.resetMeasurements(isOverflowing);
  }, [
    overflowHook.resetMeasurements,
    dynamicCollapseHook.resetMeasurements,
    instantCollapseHook.resetMeasurements,
  ]);

  const updatePriorities = useCallback(
    (updates) => {
      // console.log(`update priorities`, updates);
      dispatchOverflowAction({ type: "set-priority", managedItems: updates });
      // Why do we need a timeout here when we don't inside resizeHandler ?
      setTimeout(measureAndInitialize, 0);
    },
    [measureAndInitialize]
  );

  // Important that we register our resize handler before we measure and
  // initialize. The initialization may trigger changes which we want the
  // resize observer to detect (when we have nested overflowables).
  useResizeObserver(ref, MONITORED_DIMENSIONS[orientation], resizeHandler);

  useLayoutEffectOnce(managedItems.length > 0, measureAndInitialize, [
    managedItems,
    measureAndInitialize,
  ]);

  useLayoutEffectSkipFirst(() => {
    if (managedItemCountRef.current !== managedItems.length) {
      // console.log(
      //   `[useOverflowLayout<${label}>] useLayoutEffect we now have ${managedItems.length} managed items`
      // );
      managedItemCountRef.current = managedItems.length;
      measureAndInitialize();
    }
  }, [managedItems.length, measureAndInitialize]);

  return [ref, managedItems, updatePriorities, dispatchOverflowAction];
};
