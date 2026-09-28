import { useWindow } from "@salt-ds/window";
import type {
  AriaAttributes,
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEventCallback, useIsomorphicLayoutEffect } from "../../utils";
import type { DrawerProps } from "../Drawer";

type DrawerPosition = NonNullable<DrawerProps["position"]>;

interface Bounds {
  min: number;
  max: number;
}

interface DragState extends Bounds {
  pointerId: number;
  origin: number;
  originSize: number;
}

export interface SeparatorProps
  extends Pick<
    AriaAttributes,
    "aria-orientation" | "aria-valuenow" | "aria-valuemin" | "aria-valuemax"
  > {
  role: "separator";
  tabIndex: number;
  ref: (element: HTMLElement | null) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  onFocus: () => void;
}

export interface UseDrawerResizeProps {
  enabled: boolean;
  position: DrawerPosition;
  element: HTMLElement | null | undefined;
  onResizeFinish?: (event: Event, size: number) => void;
}

export interface UseDrawerResizeResult {
  sizeStyle: CSSProperties | undefined;
  isResizing: boolean;
  separatorProps: SeparatorProps;
}

const KEYBOARD_STEP = 8;
const KEYBOARD_STEP_MULTIPLIER = 5;
const PROBE_SIZE = 1e6;

const isHorizontal = (position: DrawerPosition) =>
  position === "left" || position === "right";

const growsWithCoordinate = (position: DrawerPosition) =>
  position === "left" || position === "top";

const measure = (element: HTMLElement, horizontal: boolean) => {
  const { width, height } = element.getBoundingClientRect();
  return horizontal ? width : height;
};

/** Resolves the drawer's CSS min/max size by briefly forcing it to both extremes. */
const probeBounds = (element: HTMLElement, horizontal: boolean): Bounds => {
  const property = horizontal ? "width" : "height";
  const previousValue = element.style.getPropertyValue(property);
  const previousPriority = element.style.getPropertyPriority(property);

  element.style.setProperty(property, "0px", "important");
  const min = measure(element, horizontal);
  element.style.setProperty(property, `${PROBE_SIZE}px`, "important");
  const max = measure(element, horizontal);

  if (previousValue) {
    element.style.setProperty(property, previousValue, previousPriority);
  } else {
    element.style.removeProperty(property);
  }

  return { min, max: Math.max(min, max) };
};

const clamp = (value: number, { min, max }: Bounds) =>
  Math.min(Math.max(value, min), max);

export function useDrawerResize({
  enabled,
  position,
  element,
  onResizeFinish,
}: UseDrawerResizeProps): UseDrawerResizeResult {
  const horizontal = isHorizontal(position);
  const targetWindow = useWindow();

  const [size, setSize] = useState<{ value: number; horizontal: boolean }>();
  const [isResizing, setIsResizing] = useState(false);
  const [metrics, setMetrics] = useState<(Bounds & { current: number }) | null>(
    null,
  );
  const dragRef = useRef<DragState | null>(null);
  const handleRef = useRef<HTMLElement | null>(null);
  const restoreSizeRef = useRef<number | null>(null);
  const initialSizeRef = useRef<number | null>(null);
  const axisRef = useRef(horizontal);

  // Probing forces layout, so key presses reuse the last bounds.
  const boundsRef = useRef<Bounds | null>(null);

  const readMetrics = useEventCallback((reuseBounds = false) => {
    if (!element) return null;
    const bounds =
      reuseBounds && boundsRef.current
        ? boundsRef.current
        : probeBounds(element, horizontal);
    boundsRef.current = bounds;
    const current = clamp(measure(element, horizontal), bounds);
    const next = { ...bounds, current };
    setMetrics(next);
    return next;
  });

  const sizeRef = useRef<number | null>(null);

  const applySize = useEventCallback((next: number, bounds: Bounds) => {
    const clamped = clamp(next, bounds);
    sizeRef.current = clamped;
    setSize({ value: clamped, horizontal });
    setMetrics({ ...bounds, current: clamped });
    return clamped;
  });

  const onPointerDown = useEventCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0 || !event.isPrimary) return;
      const current = readMetrics();
      if (!current) return;

      event.preventDefault();
      dragRef.current = {
        pointerId: event.pointerId,
        origin: horizontal ? event.clientX : event.clientY,
        originSize: current.current,
        min: current.min,
        max: current.max,
      };
      sizeRef.current = current.current;
      handleRef.current?.focus();
      setIsResizing(true);
    },
  );

  const handleDragMove = useEventCallback((event: PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;

    const coordinate = horizontal ? event.clientX : event.clientY;
    const direction = growsWithCoordinate(position) ? 1 : -1;
    const next = clamp(
      drag.originSize + (coordinate - drag.origin) * direction,
      drag,
    );
    if (next !== sizeRef.current) {
      applySize(next, drag);
    }
  });

  const handleDragEnd = useEventCallback((event: Event) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setIsResizing(false);
    const finalSize = sizeRef.current;
    if (finalSize !== null && finalSize !== drag.originSize) {
      onResizeFinish?.(event, finalSize);
    }
  });

  useEffect(() => {
    if (!isResizing || !targetWindow) return;
    if (!element) {
      dragRef.current = null;
      setIsResizing(false);
      return;
    }

    const body = targetWindow.document.body;
    const previousCursor = body.style.cursor;
    body.style.cursor = horizontal ? "ew-resize" : "ns-resize";

    targetWindow.addEventListener("pointermove", handleDragMove);
    targetWindow.addEventListener("pointerup", handleDragEnd);
    targetWindow.addEventListener("pointercancel", handleDragEnd);
    targetWindow.addEventListener("blur", handleDragEnd);
    targetWindow.addEventListener("contextmenu", handleDragEnd);
    return () => {
      body.style.cursor = previousCursor;
      targetWindow.removeEventListener("pointermove", handleDragMove);
      targetWindow.removeEventListener("pointerup", handleDragEnd);
      targetWindow.removeEventListener("pointercancel", handleDragEnd);
      targetWindow.removeEventListener("blur", handleDragEnd);
      targetWindow.removeEventListener("contextmenu", handleDragEnd);
    };
  }, [
    isResizing,
    targetWindow,
    element,
    horizontal,
    handleDragMove,
    handleDragEnd,
  ]);

  const onKeyDown = useEventCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      const { key, shiftKey } = event;
      const resizeKeys = horizontal
        ? ["ArrowLeft", "ArrowRight"]
        : ["ArrowUp", "ArrowDown"];
      if (
        !resizeKeys.includes(key) &&
        key !== "Home" &&
        key !== "End" &&
        key !== "Enter"
      ) {
        return;
      }

      const current = readMetrics(true);
      if (!current) return;

      event.preventDefault();

      const collapsed = current.current <= current.min + 1;
      let next: number;
      if (key === "Home") {
        if (!collapsed) {
          restoreSizeRef.current = current.current;
        }
        next = current.min;
      } else if (key === "End") {
        next = current.max;
      } else if (key === "Enter") {
        if (collapsed) {
          next =
            restoreSizeRef.current ?? initialSizeRef.current ?? current.max;
        } else {
          restoreSizeRef.current = current.current;
          next = current.min;
        }
      } else {
        const towardsHigherCoordinate =
          key === "ArrowRight" || key === "ArrowDown";
        const direction =
          towardsHigherCoordinate === growsWithCoordinate(position) ? 1 : -1;
        const step = shiftKey
          ? KEYBOARD_STEP * KEYBOARD_STEP_MULTIPLIER
          : KEYBOARD_STEP;
        next = current.current + step * direction;
      }

      const applied = applySize(next, current);
      if (applied !== current.current) {
        onResizeFinish?.(event.nativeEvent, applied);
      }
    },
  );

  const onFocus = useCallback(() => {
    if (!dragRef.current) readMetrics();
  }, [readMetrics]);

  const setHandle = useCallback((node: HTMLElement | null) => {
    handleRef.current = node;
  }, []);

  useEffect(() => {
    if (!enabled) {
      setSize(undefined);
      setMetrics(null);
      restoreSizeRef.current = null;
      initialSizeRef.current = null;
    }
  }, [enabled]);

  useIsomorphicLayoutEffect(() => {
    if (!enabled || !element) return;
    if (axisRef.current !== horizontal) {
      axisRef.current = horizontal;
      restoreSizeRef.current = null;
      initialSizeRef.current = null;
    }
    const next = readMetrics();
    if (next && initialSizeRef.current === null) {
      initialSizeRef.current = next.current;
    }
  }, [enabled, element, horizontal, readMetrics]);

  useEffect(() => {
    if (!enabled || !element || !targetWindow) return;
    const onResize = () => readMetrics();
    targetWindow.addEventListener("resize", onResize);
    return () => targetWindow.removeEventListener("resize", onResize);
  }, [enabled, element, targetWindow, readMetrics]);

  // Unsectioned drawers scroll themselves, so offset the handle to keep it on the edge.
  useEffect(() => {
    if (!enabled || !element) return;
    const onScroll = () => {
      const handle = handleRef.current;
      if (!handle) return;
      handle.style.setProperty(
        "--drawerResizeHandle-scrollLeft",
        `${element.scrollLeft}px`,
      );
      handle.style.setProperty(
        "--drawerResizeHandle-scrollTop",
        `${element.scrollTop}px`,
      );
    };
    onScroll();
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => element.removeEventListener("scroll", onScroll);
  }, [enabled, element]);

  return {
    sizeStyle:
      enabled && size?.horizontal === horizontal
        ? { [horizontal ? "width" : "height"]: size.value }
        : undefined,
    isResizing,
    separatorProps: {
      role: "separator",
      tabIndex: 0,
      ref: setHandle,
      "aria-orientation": horizontal ? "vertical" : "horizontal",
      "aria-valuenow": metrics ? Math.round(metrics.current) : undefined,
      "aria-valuemin": metrics ? Math.round(metrics.min) : undefined,
      "aria-valuemax": metrics ? Math.round(metrics.max) : undefined,
      onPointerDown,
      onKeyDown,
      onFocus,
    },
  };
}
