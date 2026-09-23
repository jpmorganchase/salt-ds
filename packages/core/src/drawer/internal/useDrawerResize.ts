import type {
  AriaAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEventCallback, useIsomorphicLayoutEffect } from "../../utils";

export type DrawerResizePosition = "left" | "right" | "top" | "bottom";

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
    | "aria-orientation"
    | "aria-valuenow"
    | "aria-valuemin"
    | "aria-valuemax"
    | "aria-valuetext"
  > {
  role: "separator";
  tabIndex: number;
  ref: (element: HTMLElement | null) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  onLostPointerCapture: (event: ReactPointerEvent<HTMLElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  onFocus: () => void;
}

export interface UseDrawerResizeProps {
  /** Resizing is only wired up when enabled. */
  enabled: boolean;
  /** Edge the drawer is anchored to. */
  position: DrawerResizePosition;
  /** The drawer element being resized. */
  element: HTMLElement | null | undefined;
}

export interface UseDrawerResizeResult {
  /** The user defined size in px, or `undefined` while the drawer keeps its CSS defined size. */
  size: number | undefined;
  /** Whether a pointer drag is in progress. */
  isResizing: boolean;
  /** Props for the resize handle. */
  separatorProps: SeparatorProps;
}

const KEYBOARD_STEP = 8;
const KEYBOARD_LARGE_STEP = 40;
/** Large enough to hit any CSS max constraint. */
const PROBE_SIZE = 1e6;
/**
 * How far beyond the Drawer's edge a press still grabs the handle, matching
 * the `hitAreaMargins` defaults the documented Splitter relies on. Inside the
 * Drawer the handle element covers this itself.
 */
const OUTSIDE_HIT_MARGIN = { fine: 5, coarse: 15 };

const isHorizontal = (position: DrawerResizePosition) =>
  position === "left" || position === "right";

/** Whether dragging towards higher coordinates makes the drawer bigger. */
const growsWithCoordinate = (position: DrawerResizePosition) =>
  position === "left" || position === "top";

const measure = (element: HTMLElement, horizontal: boolean) => {
  const { width, height } = element.getBoundingClientRect();
  return horizontal ? width : height;
};

/**
 * Resolves the drawer's own CSS size constraints by momentarily forcing it to
 * the extremes and measuring the result. This honours any CSS constraint
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
}: UseDrawerResizeProps): UseDrawerResizeResult {
  const horizontal = isHorizontal(position);

  const [size, setSize] = useState<number | undefined>(undefined);
  const [isResizing, setIsResizing] = useState(false);
  // Mirrors the drawer's current and available size for `aria-value*`.
  const [metrics, setMetrics] = useState<(Bounds & { current: number }) | null>(
    null,
  );
  const dragRef = useRef<DragState | null>(null);
  const restoreCursorRef = useRef<(() => void) | null>(null);
  const handleRef = useRef<HTMLElement | null>(null);
  // Size to return to when a collapsed drawer is restored with Enter.
  const restoreSizeRef = useRef<number | null>(null);

  const readMetrics = useEventCallback(() => {
    if (!element) return null;
    const bounds = probeBounds(element, horizontal);
    const current = clamp(measure(element, horizontal), bounds);
    const next = { ...bounds, current };
    setMetrics(next);
    return next;
  });

  const applySize = useEventCallback((next: number, bounds: Bounds) => {
    const clamped = clamp(next, bounds);
    setSize(clamped);
    setMetrics({ ...bounds, current: clamped });
  });

  const lockCursor = useEventCallback(() => {
    const body = element?.ownerDocument?.body;
    if (!body) return;
    const previous = body.style.cursor;
    body.style.cursor = horizontal ? "ew-resize" : "ns-resize";
    restoreCursorRef.current = () => {
      body.style.cursor = previous;
      restoreCursorRef.current = null;
    };
  });

  const endDrag = useEventCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    const handle = handleRef.current;
    if (handle?.hasPointerCapture(drag.pointerId)) {
      handle.releasePointerCapture(drag.pointerId);
    }
    dragRef.current = null;
    restoreCursorRef.current?.();
    setIsResizing(false);
  });

  /** Starts a drag from a pointer anywhere within the handle's hit area. */
  const beginDrag = useEventCallback(
    (pointerId: number, coordinate: number) => {
      const handle = handleRef.current;
      if (!element || !handle) return false;

      const current = readMetrics();
      if (!current) return false;

      handle.setPointerCapture(pointerId);
      dragRef.current = {
        pointerId,
        origin: coordinate,
        originSize: current.current,
        min: current.min,
        max: current.max,
      };
      lockCursor();
      setIsResizing(true);
      return true;
    },
  );

  const onPointerDown = useEventCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      const coordinate = horizontal ? event.clientX : event.clientY;
      if (beginDrag(event.pointerId, coordinate)) {
        event.preventDefault();
      }
    },
  );

  const onPointerMove = useEventCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const coordinate = horizontal ? event.clientX : event.clientY;
      const delta = coordinate - drag.origin;
      const direction = growsWithCoordinate(position) ? 1 : -1;
      applySize(drag.originSize + delta * direction, drag);
    },
  );

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

      const current = readMetrics();
      if (!current) return;

      event.preventDefault();

      if (key === "Home") {
        applySize(current.min, current);
        return;
      }
      if (key === "End") {
        applySize(current.max, current);
        return;
      }
      // Collapses to the smallest allowed size, or restores the size the drawer
      // had before it was collapsed, as the Splitter does.
      if (key === "Enter") {
        const collapsed = current.current <= current.min + 1;
        if (collapsed) {
          applySize(restoreSizeRef.current ?? current.max, current);
        } else {
          restoreSizeRef.current = current.current;
          applySize(current.min, current);
        }
        return;
      }

      const towardsHigherCoordinate =
        key === "ArrowRight" || key === "ArrowDown";
      const direction =
        towardsHigherCoordinate === growsWithCoordinate(position) ? 1 : -1;
      const step = shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
      applySize(current.current + step * direction, current);
    },
  );

  const onFocus = useCallback(() => {
    readMetrics();
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
    }
  }, [enabled]);

  // Describe the separator before first paint, so a focusable separator always
  // exposes `aria-valuenow` to assistive technology.
  useIsomorphicLayoutEffect(() => {
    if (enabled && element) {
      readMetrics();
    }
  }, [enabled, element, readMetrics]);

  // The handle element covers its hit area inside the Drawer, but the band
  // just beyond the Drawer's edge belongs to the page. Content out there is
  // inert while the Drawer is modal, so presses land on the document instead;
  // claiming them in the capture phase also stops `useDismiss`, which listens
  // in the bubble phase, from closing the Drawer.
  useEffect(() => {
    if (!enabled || !element) return;
    const doc = element.ownerDocument;
    const targetWindow = doc.defaultView;
    if (!targetWindow) return;
    // The root rather than the body, so the cursor applies wherever the
    // pointer lands, including areas the body does not cover.
    const root = doc.documentElement;
    const coarsePointer = targetWindow.matchMedia("(pointer: coarse)");

    const isWithinHitArea = (event: PointerEvent) => {
      const handle = handleRef.current;
      if (!handle) return false;

      const margin = coarsePointer.matches
        ? OUTSIDE_HIT_MARGIN.coarse
        : OUTSIDE_HIT_MARGIN.fine;
      const { top, right, bottom, left } = handle.getBoundingClientRect();
      return (
        event.clientX >= left - margin &&
        event.clientX <= right + margin &&
        event.clientY >= top - margin &&
        event.clientY <= bottom + margin
      );
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || event.defaultPrevented) return;
      // Presses within the Drawer are the handle element's own business.
      if (element.contains(event.target as Node)) return;
      if (!isWithinHitArea(event)) return;

      const coordinate = horizontal ? event.clientX : event.clientY;
      if (beginDrag(event.pointerId, coordinate)) {
        event.preventDefault();
        event.stopPropagation();
        handleRef.current?.focus();
      }
    };

    // The cursor is applied across the whole hit area, including the part the
    // handle's own CSS already covers. Keeping it set while the pointer is on
    // the handle means crossing the Drawer's edge changes nothing, so the
    // cursor does not flicker back to its default for a frame.
    const onPointerMove = (event: PointerEvent) => {
      if (dragRef.current) return;
      if (isWithinHitArea(event)) {
        root.style.setProperty(
          "cursor",
          horizontal ? "ew-resize" : "ns-resize",
        );
      } else {
        root.style.removeProperty("cursor");
      }
    };

    doc.addEventListener("pointerdown", onPointerDown, true);
    doc.addEventListener("pointermove", onPointerMove, true);
    return () => {
      doc.removeEventListener("pointerdown", onPointerDown, true);
      doc.removeEventListener("pointermove", onPointerMove, true);
      root.style.removeProperty("cursor");
    };
  }, [enabled, element, horizontal, beginDrag]);

  useEffect(() => () => restoreCursorRef.current?.(), []);

  return {
    size: enabled ? size : undefined,
    isResizing,
    separatorProps: {
      role: "separator",
      tabIndex: 0,
      ref: setHandle,
      "aria-orientation": horizontal ? "vertical" : "horizontal",
      "aria-valuenow": metrics ? Math.round(metrics.current) : undefined,
      "aria-valuemin": metrics ? Math.round(metrics.min) : undefined,
      "aria-valuemax": metrics ? Math.round(metrics.max) : undefined,
      "aria-valuetext": metrics
        ? `${Math.round(metrics.current)} pixels`
        : undefined,
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onLostPointerCapture: endDrag,
      onKeyDown,
      onFocus,
    },
  };
}
