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
  /** Smallest size in px the drawer can be resized to. */
  minSize?: number;
  /** Largest size in px the drawer can be resized to. Defaults to the viewport. */
  maxSize?: number;
  /** Size in px the drawer starts at. */
  defaultSize?: number;
  /** Called with the new size in px each time the drawer is resized. */
  onResize?: (size: number) => void;
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

/**
 * Floor for `minSize`. Keeps the drawer at least as large as the handle's hit
 * area so the handle can always be grabbed again, however small the drawer is
 * resized. Matches `--drawerResizeHandle-hitSize` in DrawerResizeHandle.css.
 */
const MIN_RESIZE_SIZE = 16;

const isHorizontal = (position: DrawerResizePosition) =>
  position === "left" || position === "right";

/** Whether dragging towards higher coordinates makes the drawer bigger. */
const growsWithCoordinate = (position: DrawerResizePosition) =>
  position === "left" || position === "top";

const measure = (element: HTMLElement, horizontal: boolean) => {
  const { width, height } = element.getBoundingClientRect();
  return horizontal ? width : height;
};

const clamp = (value: number, { min, max }: Bounds) =>
  Math.min(Math.max(value, min), max);

/**
 * Resolves the limits a drag or keypress is clamped to. `maxSize` falls back to
 * the viewport along the resize axis, which is also the cap the Drawer's own
 * `max-width: 100%` / `max-height: 100%` enforces.
 */
const resolveBounds = (
  element: HTMLElement,
  horizontal: boolean,
  minSize: number | undefined,
  maxSize: number | undefined,
): Bounds => {
  const view = element.ownerDocument.defaultView;
  const viewportSize = horizontal ? view?.innerWidth : view?.innerHeight;
  const min = Math.max(minSize ?? MIN_RESIZE_SIZE, MIN_RESIZE_SIZE);
  const max = maxSize ?? viewportSize ?? Number.POSITIVE_INFINITY;
  return { min, max: Math.max(min, max) };
};

export function useDrawerResize({
  enabled,
  position,
  element,
  minSize,
  maxSize,
  defaultSize,
  onResize,
}: UseDrawerResizeProps): UseDrawerResizeResult {
  const horizontal = isHorizontal(position);

  const [size, setSize] = useState<number | undefined>(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  // The drawer's rendered size, so `aria-valuenow` is correct before the first
  // resize, while the drawer still takes its size from CSS.
  const [measuredSize, setMeasuredSize] = useState<number | undefined>(
    undefined,
  );
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [axis, setAxis] = useState(horizontal);

  const dragRef = useRef<DragState | null>(null);
  const handleRef = useRef<HTMLElement | null>(null);

  // A size captured on one axis must never be applied to the other, so a
  // `left` drawer's width is not reused as a `top` drawer's height. Resetting
  // during render rather than in an effect means the drawer is committed at its
  // new size, so the effects below measure the size the user actually sees.
  if (axis !== horizontal) {
    setAxis(horizontal);
    setSize(defaultSize);
    setMeasuredSize(undefined);
  }

  const currentSize = size ?? measuredSize;

  const readBounds = useEventCallback(() =>
    element ? resolveBounds(element, horizontal, minSize, maxSize) : null,
  );

  const applySize = useEventCallback((next: number, within: Bounds) => {
    const clamped = clamp(next, within);
    setSize(clamped);
    setMeasuredSize(clamped);
    setBounds(within);
    onResize?.(clamped);
  });

  const endDrag = useEventCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    const handle = handleRef.current;
    if (handle?.hasPointerCapture(drag.pointerId)) {
      handle.releasePointerCapture(drag.pointerId);
    }
    dragRef.current = null;
    setIsResizing(false);
  });

  const onPointerDown = useEventCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      const handle = handleRef.current;
      const nextBounds = readBounds();
      if (!element || !handle || !nextBounds) return;

      handle.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        origin: horizontal ? event.clientX : event.clientY,
        originSize: size ?? measure(element, horizontal),
        ...nextBounds,
      };
      setBounds(nextBounds);
      setIsResizing(true);
      event.preventDefault();
    },
  );

  const onPointerMove = useEventCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      // A drag that lost its pointer events, for instance because the drawer
      // closed mid-drag, must not resume tracking a released pointer.
      if (event.buttons === 0) {
        endDrag();
        return;
      }

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
      if (!resizeKeys.includes(key) && key !== "Home" && key !== "End") {
        return;
      }

      const nextBounds = readBounds();
      if (!element || !nextBounds) return;

      event.preventDefault();

      if (key === "Home") {
        applySize(nextBounds.min, nextBounds);
        return;
      }
      if (key === "End") {
        applySize(nextBounds.max, nextBounds);
        return;
      }

      const towardsHigherCoordinate =
        key === "ArrowRight" || key === "ArrowDown";
      const direction =
        towardsHigherCoordinate === growsWithCoordinate(position) ? 1 : -1;
      const step = shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
      const from = size ?? measure(element, horizontal);
      applySize(from + step * direction, nextBounds);
    },
  );

  const onFocus = useEventCallback(() => {
    if (!element) return;
    setMeasuredSize(measure(element, horizontal));
    setBounds(readBounds());
  });

  const setHandle = useCallback((node: HTMLElement | null) => {
    handleRef.current = node;
  }, []);

  // Restore the drawer's CSS defined size when resizing is turned off, and end
  // any drag that was interrupted by it. `defaultSize` is kept so turning
  // resizing back on starts from it again.
  useEffect(() => {
    if (!enabled) {
      endDrag();
      setSize(defaultSize);
      setMeasuredSize(undefined);
      setBounds(null);
    }
  }, [enabled, endDrag, defaultSize]);

  // A drag interrupted by the drawer closing never receives its pointer events,
  // because the handle is detached before they are dispatched.
  useEffect(() => () => endDrag(), [endDrag]);

  // Describe the separator before first paint, so a focusable separator always
  // exposes `aria-valuenow` to assistive technology, and bring a `defaultSize`
  // or a size left over from wider limits back within range.
  useIsomorphicLayoutEffect(() => {
    if (!enabled || !element) return;
    const nextBounds = resolveBounds(element, horizontal, minSize, maxSize);
    setBounds(nextBounds);
    setMeasuredSize(measure(element, horizontal));
    setSize((current) =>
      current === undefined ? current : clamp(current, nextBounds),
    );
  }, [enabled, element, horizontal, minSize, maxSize]);

  // `maxSize` defaults to the viewport, so a viewport change moves the limit
  // and any size beyond it has to come back within range.
  const clampToViewport = useEventCallback(() => {
    if (!element) return;
    const nextBounds = resolveBounds(element, horizontal, minSize, maxSize);
    setBounds(nextBounds);
    if (size === undefined) return;
    const clamped = clamp(size, nextBounds);
    if (clamped !== size) {
      applySize(clamped, nextBounds);
    }
  });

  useEffect(() => {
    if (!enabled || !element) return;
    const view = element.ownerDocument.defaultView;
    if (!view) return;

    view.addEventListener("resize", clampToViewport);
    return () => view.removeEventListener("resize", clampToViewport);
  }, [enabled, element, clampToViewport]);

  return {
    size: enabled ? size : undefined,
    isResizing,
    separatorProps: {
      role: "separator",
      tabIndex: 0,
      ref: setHandle,
      "aria-orientation": horizontal ? "vertical" : "horizontal",
      "aria-valuenow":
        currentSize !== undefined ? Math.round(currentSize) : undefined,
      "aria-valuemin": bounds ? Math.round(bounds.min) : undefined,
      "aria-valuemax": bounds ? Math.round(bounds.max) : undefined,
      "aria-valuetext":
        currentSize !== undefined
          ? `${Math.round(currentSize)} pixels`
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
