import { useWindow } from "@salt-ds/window";
import type {
  AriaAttributes,
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useControlled,
  useEventCallback,
  useIsomorphicLayoutEffect,
} from "../../utils";
import type { DrawerProps } from "../Drawer";

type DrawerPosition = NonNullable<DrawerProps["position"]>;

interface Bounds {
  min: number;
  max: number;
}

interface DragState extends Bounds {
  pointerId: number;
  startX: number;
  startY: number;
  originSize: number;
  moved: boolean;
}

/** Click-to-place resizing */
interface PlacingState extends Bounds {
  /** In viewport coordinates. */
  guideOffset: number;
  /** The placing press started on the guide layer. */
  pressed: boolean;
}

type Interaction = "inactive" | "hover" | "active" | "placing";

type HitEvent = Pick<MouseEvent, "clientX" | "clientY" | "target">;

export interface SeparatorProps
  extends Pick<
    AriaAttributes,
    "aria-orientation" | "aria-valuenow" | "aria-valuemin" | "aria-valuemax"
  > {
  role: "separator";
  tabIndex: number;
  ref: (element: HTMLElement | null) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  onFocus: () => void;
}

export interface GuideProps {
  ref: (element: HTMLElement | null) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onClick: (event: ReactMouseEvent<HTMLElement>) => void;
  onContextMenu: () => void;
}

export interface UseDrawerResizeProps {
  enabled: boolean;
  position: DrawerPosition;
  element: HTMLElement | null | undefined;
  size?: number;
  onResize?: (event: Event, size: number) => void;
  onResizeEnd?: (event: Event, size: number) => void;
}

export interface UseDrawerResizeResult {
  sizeStyle: CSSProperties | undefined;
  isResizing: boolean;
  isHovered: boolean;
  isPlacing: boolean;
  isInHitArea: (event: HitEvent) => boolean;
  separatorProps: SeparatorProps;
  guideProps: GuideProps;
}

const KEYBOARD_STEP = 8;
const KEYBOARD_STEP_MULTIPLIER = 5;
const PROBE_SIZE = 1e6;
// WCAG 2.5.8 (AA) minimum target size.
const MIN_TARGET_SIZE = 24;
// A press that moves less than this is a click on the handle, not a drag.
const CLICK_THRESHOLD = 4;

const isElement = (target: EventTarget | null): target is Element =>
  target !== null && (target as Node).nodeType === 1;

const focusWithoutRing = (element: HTMLElement | null) =>
  element?.focus({
    preventScroll: true,
    focusVisible: false,
  } as FocusOptions);

/** Shows the cursor everywhere in the document, over any element's own cursor. */
const setDocumentCursor = (ownerDocument: Document, cursor: string) => {
  const view = ownerDocument.defaultView as (Window & typeof globalThis) | null;
  if (!view || !ownerDocument.adoptedStyleSheets) return undefined;
  const sheet = new view.CSSStyleSheet();
  sheet.replaceSync(`*, *:hover { cursor: ${cursor} !important; }`);
  ownerDocument.adoptedStyleSheets = [
    ...ownerDocument.adoptedStyleSheets,
    sheet,
  ];
  return () => {
    ownerDocument.adoptedStyleSheets = ownerDocument.adoptedStyleSheets.filter(
      (adopted) => adopted !== sheet,
    );
  };
};

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

/** Size the drawer needs for its moving edge to sit at the given point. */
const sizeFromPoint = (
  rect: DOMRect,
  position: DrawerPosition,
  { clientX: x, clientY: y }: Pick<MouseEvent, "clientX" | "clientY">,
) => {
  switch (position) {
    case "left":
      return x - rect.left;
    case "right":
      return rect.right - x;
    case "top":
      return y - rect.top;
    case "bottom":
      return rect.bottom - y;
  }
};

/** Viewport coordinate of the moving edge for a given size. */
const edgeFromSize = (
  rect: DOMRect,
  position: DrawerPosition,
  size: number,
) => {
  switch (position) {
    case "left":
      return rect.left + size;
    case "right":
      return rect.right - size;
    case "top":
      return rect.top + size;
    case "bottom":
      return rect.bottom - size;
  }
};

export function useDrawerResize({
  enabled,
  position,
  element,
  size: sizeProp,
  onResize,
  onResizeEnd,
}: UseDrawerResizeProps): UseDrawerResizeResult {
  const horizontal = isHorizontal(position);
  const targetWindow = useWindow();

  // Uncontrolled, the size stays unset until the user resizes, so the drawer keeps its CSS size.
  const [sizeState, setSizeState, isControlled] = useControlled<
    number | undefined
  >({
    controlled: sizeProp,
    default: undefined,
    name: "Drawer",
    state: "size",
  });
  // Drop the uncontrolled size when `position` switches axis.
  const [sizeAxisHorizontal, setSizeAxisHorizontal] = useState(horizontal);
  const size =
    isControlled || sizeAxisHorizontal === horizontal ? sizeState : undefined;

  const [interaction, setInteraction] = useState<Interaction>("inactive");
  const [metrics, setMetrics] = useState<(Bounds & { current: number }) | null>(
    null,
  );
  const dragRef = useRef<DragState | null>(null);
  const placingRef = useRef<PlacingState | null>(null);
  const handleRef = useRef<HTMLElement | null>(null);
  const guideRef = useRef<HTMLElement | null>(null);
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

  const applySize = useEventCallback(
    (event: Event, next: number, bounds: Bounds) => {
      const clamped = clamp(next, bounds);
      sizeRef.current = clamped;
      setSizeState(clamped);
      setSizeAxisHorizontal(horizontal);
      onResize?.(event, clamped);
      return clamped;
    },
  );

  // The handle's box extended outward, away from the content, to the minimum target size.
  const getHitRect = () => {
    const handle = handleRef.current;
    if (!handle) return null;
    const { left, top, right, bottom, width, height } =
      handle.getBoundingClientRect();
    const outside = Math.max(
      0,
      MIN_TARGET_SIZE - (horizontal ? width : height),
    );
    return {
      left: position === "right" ? left - outside : left,
      right: position === "left" ? right + outside : right,
      top: position === "bottom" ? top - outside : top,
      bottom: position === "top" ? bottom + outside : bottom,
    };
  };

  // Everything outside the modal drawer is inert, so any other element under the pointer is a layer above it.
  const isViableTarget = (target: EventTarget | null) => {
    if (!element) return false;
    if (!isElement(target)) return true;
    return (
      element.contains(target) ||
      target.contains(element) ||
      target.closest("[inert]") !== null
    );
  };

  const isInHitArea = useEventCallback((event: HitEvent) => {
    if (!enabled) return false;
    const rect = getHitRect();
    if (!rect) return false;
    const { clientX: x, clientY: y } = event;
    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom &&
      isViableTarget(event.target)
    );
  });

  const startDrag = useEventCallback((event: PointerEvent) => {
    const current = readMetrics();
    if (!current) return;

    event.preventDefault();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originSize: current.current,
      min: current.min,
      max: current.max,
      moved: false,
    };
    sizeRef.current = current.current;
    focusWithoutRing(handleRef.current);
    setInteraction("active");
  });

  const moveDrag = useEventCallback((event: PointerEvent, drag: DragState) => {
    // Small movement keeps the press a click, so it can start placing the edge by click.
    if (!drag.moved) {
      if (
        Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) <
        CLICK_THRESHOLD
      ) {
        return;
      }
      drag.moved = true;
      try {
        handleRef.current?.setPointerCapture(event.pointerId);
      } catch {
        // The pointer is no longer active.
      }
    }

    const coordinate = horizontal ? event.clientX : event.clientY;
    const origin = horizontal ? drag.startX : drag.startY;
    const direction = growsWithCoordinate(position) ? 1 : -1;
    const next = clamp(
      drag.originSize + (coordinate - origin) * direction,
      drag,
    );
    if (next !== sizeRef.current) {
      applySize(event, next, drag);
    }
  });

  // Set directly, to avoid a re-render on every pointer move.
  const moveGuide = (offset: number) => {
    const placing = placingRef.current;
    if (!placing) return;
    placing.guideOffset = offset;
    guideRef.current?.style.setProperty(
      "--drawerResizeGuide-offset",
      `${offset}px`,
    );
  };

  const setGuide = useCallback((node: HTMLElement | null) => {
    guideRef.current = node;
    const placing = placingRef.current;
    if (node && placing) {
      node.style.setProperty(
        "--drawerResizeGuide-offset",
        `${placing.guideOffset}px`,
      );
    }
  }, []);

  const startPlacing = useEventCallback((drag: DragState) => {
    if (!element) return;
    placingRef.current = {
      min: drag.min,
      max: drag.max,
      guideOffset: edgeFromSize(
        element.getBoundingClientRect(),
        position,
        drag.originSize,
      ),
      pressed: false,
    };
    setInteraction("placing");
  });

  const stopPlacing = useEventCallback(() => {
    if (!placingRef.current) return;
    placingRef.current = null;
    setInteraction("inactive");
  });

  const endDrag = useEventCallback((event: Event) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    const stillHovered =
      "pointerType" in event &&
      (event as PointerEvent).pointerType !== "touch" &&
      isInHitArea(event as PointerEvent);
    setInteraction(stillHovered ? "hover" : "inactive");
    const finalSize = sizeRef.current;
    if (finalSize !== null && finalSize !== drag.originSize) {
      onResizeEnd?.(event, finalSize);
    }
  });

  const moveGuideToPointer = (
    event: Pick<MouseEvent, "clientX" | "clientY">,
  ) => {
    const placing = placingRef.current;
    if (!placing || !element) return;
    const rect = element.getBoundingClientRect();
    moveGuide(
      edgeFromSize(
        rect,
        position,
        clamp(sizeFromPoint(rect, position, event), placing),
      ),
    );
  };

  const onGuidePointerDown = useEventCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const placing = placingRef.current;
      if (!placing) return;
      if (event.pointerType === "mouse" && event.button > 0) {
        stopPlacing();
        return;
      }
      // Keeps focus on the handle.
      event.preventDefault();
      // React bubbles events from the portal up to the drawer.
      event.stopPropagation();
      placing.pressed = true;
      moveGuideToPointer(event);
    },
  );

  const onGuidePointerMove = useEventCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      moveGuideToPointer(event);
    },
  );

  const onGuideClick = useEventCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      const placing = placingRef.current;
      // Ignores the click that started placing.
      if (!placing?.pressed || !element) return;
      event.stopPropagation();
      stopPlacing();
      // The drawer may have moved since placing started, e.g. while sliding in.
      const rect = element.getBoundingClientRect();
      const next = clamp(sizeFromPoint(rect, position, event), placing);
      const current = clamp(measure(element, horizontal), placing);
      if (next !== current) {
        const applied = applySize(event.nativeEvent, next, placing);
        onResizeEnd?.(event.nativeEvent, applied);
      }
      focusWithoutRing(handleRef.current);
    },
  );

  useEffect(() => {
    if (!enabled || !element || !targetWindow) return;
    const ownerDocument = targetWindow.document;

    const onPointerDown = (event: PointerEvent) => {
      if (event.defaultPrevented || !event.isPrimary) return;
      if (event.pointerType === "mouse" && event.button > 0) return;
      if (placingRef.current || dragRef.current || !isInHitArea(event)) return;
      startDrag(event);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.defaultPrevented) return;
      if (placingRef.current) return;
      const drag = dragRef.current;
      if (!drag) {
        // Touch has no hover, so it would leave the hover state behind.
        if (event.pointerType !== "touch") {
          setInteraction(isInHitArea(event) ? "hover" : "inactive");
        }
        return;
      }
      if (event.pointerId !== drag.pointerId) return;
      // No buttons pressed means the release was missed, e.g. over an iframe.
      if (event.buttons === 0) {
        endDrag(event);
        return;
      }
      moveDrag(event, drag);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.defaultPrevented) return;
      if (event.pointerType === "mouse" && event.button > 0) return;
      const drag = dragRef.current;
      if (drag?.pointerId !== event.pointerId) return;
      event.preventDefault();
      if (!drag.moved) {
        dragRef.current = null;
        startPlacing(drag);
        return;
      }
      endDrag(event);
    };

    const onPointerCancel = (event: PointerEvent) => {
      if (dragRef.current?.pointerId === event.pointerId) endDrag(event);
    };

    const onContextMenu = (event: MouseEvent) => {
      if (!event.defaultPrevented) endDrag(event);
    };

    const onBlur = (event: FocusEvent) => {
      endDrag(event);
      stopPlacing();
    };

    // "pointerout" doesn't fire when the pointer moves into an iframe, so hover would stick.
    const onPointerOut = (event: PointerEvent) => {
      if (
        !dragRef.current &&
        isElement(event.relatedTarget) &&
        event.relatedTarget.tagName === "IFRAME"
      ) {
        setInteraction("inactive");
      }
    };

    ownerDocument.addEventListener("pointerdown", onPointerDown, true);
    ownerDocument.addEventListener("pointermove", onPointerMove);
    ownerDocument.addEventListener("pointerup", onPointerUp, true);
    ownerDocument.addEventListener("pointercancel", onPointerCancel);
    ownerDocument.addEventListener("contextmenu", onContextMenu, true);
    ownerDocument.addEventListener("pointerout", onPointerOut);
    targetWindow.addEventListener("blur", onBlur);
    return () => {
      ownerDocument.removeEventListener("pointerdown", onPointerDown, true);
      ownerDocument.removeEventListener("pointermove", onPointerMove);
      ownerDocument.removeEventListener("pointerup", onPointerUp, true);
      ownerDocument.removeEventListener("pointercancel", onPointerCancel);
      ownerDocument.removeEventListener("contextmenu", onContextMenu, true);
      ownerDocument.removeEventListener("pointerout", onPointerOut);
      targetWindow.removeEventListener("blur", onBlur);
      dragRef.current = null;
      placingRef.current = null;
      setInteraction("inactive");
    };
  }, [
    enabled,
    element,
    targetWindow,
    isInHitArea,
    startDrag,
    moveDrag,
    endDrag,
    startPlacing,
    stopPlacing,
  ]);

  const showResizeCursor = interaction !== "inactive";
  useEffect(() => {
    if (!showResizeCursor || !targetWindow) return;
    return setDocumentCursor(
      targetWindow.document,
      horizontal ? "ew-resize" : "ns-resize",
    );
  }, [showResizeCursor, targetWindow, horizontal]);

  const onKeyDown = useEventCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      const { key, shiftKey } = event;
      if (placingRef.current) {
        stopPlacing();
        if (key === "Escape") {
          event.preventDefault();
          // Keeps the drawer open.
          event.stopPropagation();
          return;
        }
      }
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

      if (clamp(next, current) === current.current) return;
      const applied = applySize(event.nativeEvent, next, current);
      onResizeEnd?.(event.nativeEvent, applied);
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
      setSizeState(undefined);
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

  // Sync the separator's aria values with the rendered size.
  useIsomorphicLayoutEffect(() => {
    if (!enabled || !element || size === undefined) return;
    readMetrics(true);
  }, [enabled, element, size, readMetrics]);

  useEffect(() => {
    if (!enabled || !element || !targetWindow) return;
    const onResize = () => {
      // The size limits stored for placing are stale after the window resizes.
      stopPlacing();
      readMetrics();
    };
    targetWindow.addEventListener("resize", onResize);
    return () => targetWindow.removeEventListener("resize", onResize);
  }, [enabled, element, targetWindow, readMetrics, stopPlacing]);

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
      size !== undefined
        ? { [horizontal ? "width" : "height"]: size }
        : undefined,
    isResizing: interaction === "active" || interaction === "placing",
    isHovered: interaction === "hover",
    isPlacing: interaction === "placing",
    isInHitArea,
    separatorProps: {
      role: "separator",
      tabIndex: 0,
      ref: setHandle,
      "aria-orientation": horizontal ? "vertical" : "horizontal",
      "aria-valuenow": metrics ? Math.round(metrics.current) : undefined,
      "aria-valuemin": metrics ? Math.round(metrics.min) : undefined,
      "aria-valuemax": metrics ? Math.round(metrics.max) : undefined,
      onKeyDown,
      onFocus,
    },
    guideProps: {
      ref: setGuide,
      onPointerDown: onGuidePointerDown,
      onPointerMove: onGuidePointerMove,
      onClick: onGuideClick,
      onContextMenu: stopPlacing,
    },
  };
}
