import { type RefObject, useEffect } from "react";
import type { TabsContextValue, TabsRenderMode } from "../contexts/TabsContext";
import { getIntrinsicMeasuredWidth } from "./widthMeasurement";

const MIN_TRUSTED_RENDERED_TAB_WIDTH = 0.5;

interface UseRenderedTabWidthProps {
  hostElement: HTMLDivElement | null;
  renderMode: TabsRenderMode;
  tabRootRef: RefObject<HTMLDivElement>;
  targetWindow: Window | null | undefined;
  updateRenderedTab: TabsContextValue["updateRenderedTab"];
  value: string;
}

function isSecondaryMeasurementContext(element: HTMLElement) {
  return (
    element.closest(".saltTabOverflowList-list") ||
    element.closest(".saltTabList-measureContainer")
  );
}

export function useRenderedTabWidth({
  hostElement,
  renderMode,
  tabRootRef,
  targetWindow,
  updateRenderedTab,
  value,
}: UseRenderedTabWidthProps) {
  useEffect(() => {
    if (!hostElement) {
      return;
    }

    const element = tabRootRef.current;
    const resizeObserverCtor = (
      targetWindow as
        | (Window & { ResizeObserver?: typeof ResizeObserver })
        | undefined
    )?.ResizeObserver;
    const mutationObserverCtor = (
      targetWindow as
        | (Window & { MutationObserver?: typeof MutationObserver })
        | undefined
    )?.MutationObserver;
    if (!element || !resizeObserverCtor) {
      return;
    }

    const updateWidth = (allowSecondaryMeasurementContext = false) => {
      if (!element.isConnected) {
        return;
      }

      // Preserve the strip width while a tab is rendered in the overflow menu.
      // Overflow items stretch to the menu width, and hidden measurement tabs
      // can collapse to a different intrinsic size. Neither width is suitable
      // for deciding whether the tab fits back in the main strip once the tab
      // is already established. A one-time seeded width is still useful for
      // newly mounted tabs before they have ever appeared in the main strip.
      if (
        !allowSecondaryMeasurementContext &&
        isSecondaryMeasurementContext(element)
      ) {
        return;
      }

      const width = getIntrinsicMeasuredWidth(element);
      if (width <= MIN_TRUSTED_RENDERED_TAB_WIDTH) {
        return;
      }

      updateRenderedTab(value, {
        width,
      });
    };

    let animationFrameId: number | null = null;
    const scheduleWidthUpdate = (allowSecondaryMeasurementContext = false) => {
      if (!targetWindow?.requestAnimationFrame) {
        updateWidth(allowSecondaryMeasurementContext);
        return;
      }

      if (animationFrameId != null) {
        targetWindow.cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = targetWindow.requestAnimationFrame(() => {
        animationFrameId = null;
        updateWidth(allowSecondaryMeasurementContext);
      });
    };

    if (renderMode === "portal") {
      scheduleWidthUpdate(true);
    } else {
      updateWidth(true);
    }

    const resizeObserver = new resizeObserverCtor(() => {
      updateWidth();
    });

    resizeObserver.observe(element);
    const mutationObserver = mutationObserverCtor
      ? new mutationObserverCtor(() => {
          scheduleWidthUpdate();
        })
      : null;

    mutationObserver?.observe(element, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => {
      if (animationFrameId != null && targetWindow) {
        targetWindow.cancelAnimationFrame(animationFrameId);
      }
      mutationObserver?.disconnect();
      resizeObserver.disconnect();
    };
  }, [
    hostElement,
    renderMode,
    tabRootRef,
    targetWindow,
    updateRenderedTab,
    value,
  ]);
}
