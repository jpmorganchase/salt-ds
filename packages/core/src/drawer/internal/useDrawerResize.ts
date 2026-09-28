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
  /** Resizing is only wired up when enabled. */
  enabled: boolean;
  /** Edge the drawer is anchored to. */
  position: DrawerPosition;
  /** The drawer element being resized. */
  element: HTMLElement | null | undefined;
  /** Called with the new size in px when a drag ends or a key resizes the drawer. */
  onResizeFinish?: (event: Event, size: number) => void;
}

export interface UseDrawerResizeResult {
  /** The user defined `width` or `height`, or `undefined` while the drawer keeps its CSS defined size. */
  sizeStyle: CSSProperties | undefined;
  /** Whether a pointer drag is in progress. */
  isResizing: boolean;
  /** Props for the resize handle. */
  separatorProps: SeparatorProps;
}

const KEYBOARD_STEP = 8;
/** Applied to the step while Shift is held. */
const KEYBOARD_STEP_MULTIPLIER = 5;
/** Large enough to hit any CSS max constraint. */
const PROBE_SIZE = 1e6;

const isHorizontal = (position: DrawerPosition) =>
  position === "left" || position === "right";

/** Whether dragging towards higher coordinates makes the drawer bigger. */
const growsWithCoordinate = (position: DrawerPosition) =>
  position === "left" || position === "top";

const measure = (element: HTMLElement, horizontal: boolean) => {
  const { width, height } = element.getBoundingClientRect();
  return horizontal ? width : height;
};

/**
 * Resolves the drawer's own CSS size constraints by momentarily forcing it to
 * the extremes and measuring the result. This honors any CSS constraint
 * (`px`, `%`, `vw`, `clamp()`, tokens, media queries) without re-implementing
 * CSS value resolution, and never paints because it happens synchronously.
 */
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

  // Keyed by axis, so a width is never applied as a height after `position` changes.
  const [size, setSize] = useState<{ value: number; horizontal: boolean }>();
  const [isResizing, setIsResizing] = useState(false);
  // Mirrors the drawer's current and available size for `aria-value*`.
  const [metrics, setMetrics] = useState<(Bounds & { current: number }) | null>(
    null,
  );
  const dragRef = useRef<DragState | null>(null);
  const handleRef = useRef<HTMLElement | null>(null);
  // Size to return to when a collapsed drawer is restored with Enter.
  const restoreSizeRef = useRef<number | null>(null);
  // Size the drawer opened at, used when there is no size to restore.
  const initialSizeRef = useRef<number | null>(null);
  const axisRef = useRef(horizontal);

  // Probing forces layout, so bounds are resolved once per interaction (focus, pointer
  // press, viewport resize) and reused for each key press.
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

  // Latest applied size, so a drag's end can be reported without waiting for a render.
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

  // While dragging, follow the pointer on the window, as Slider does.
  useEffect(() => {
    if (!isResizing || !targetWindow) return;
    // The Drawer has closed mid-drag, so there is nothing left to resize.
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
        // Collapses to the smallest allowed size, or restores the size the drawer
        // had before it was collapsed, as the Splitter does.
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

  // Drop any user defined size when resizing is turned off, so the drawer
  // returns to its CSS defined size.
  useEffect(() => {
    if (!enabled) {
      setSize(undefined);
      setMetrics(null);
      restoreSizeRef.current = null;
      initialSizeRef.current = null;
    }
  }, [enabled]);

  // Describe the separator before first paint, so a focusable separator always
  // exposes `aria-valuenow` to assistive technology.
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

  // Keep `aria-valuemin` / `aria-valuemax` in step with limits that depend on the viewport.
  useEffect(() => {
    if (!enabled || !element || !targetWindow) return;
    const onResize = () => readMetrics();
    targetWindow.addEventListener("resize", onResize);
    return () => targetWindow.removeEventListener("resize", onResize);
  }, [enabled, element, targetWindow, readMetrics]);

  // An unsectioned Drawer scrolls itself, which would carry the handle out of view with the
  // content, so the handle is offset by the scroll position to stay pinned to the edge.
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
