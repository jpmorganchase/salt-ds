/**
 * Prototypes of single-pointer, non-drag alternatives for resizing a Drawer (WCAG 2.2 SC 2.5.7 Dragging
 * Movements). They are built on the Drawer's public API only (`size`, `onResize`, the separator's aria values),
 * so they can be demoed without changing the component.
 */
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  type DrawerProps,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import type { ArgTypes, Meta, StoryFn } from "@storybook/react-vite";
import {
  type MouseEventHandler,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import "./drawer-resize-alternatives.stories.css";

export default {
  title: "Core/Drawer/Resize Alternatives (2.5.7 prototypes)",
  component: Drawer,
} as Meta<typeof Drawer>;

type Position = NonNullable<DrawerProps["position"]>;
type Preview = "live" | "guide";
type SizeChangeReason = "preview" | "commit" | "cancel" | "drag";

// Movement below this is treated as a click on the handle rather than a drag.
const CLICK_THRESHOLD = 4;
// Matches the Drawer's own hit area (WCAG 2.5.8 minimum target size).
const MIN_TARGET_SIZE = 24;
// Stop swallowing events from the placing press if its click never arrives.
const SWALLOW_TIMEOUT = 1000;

const loremText =
  "Incididunt adipisicing deserunt nostrud ullamco consequat consectetur magna id do irure labore fugiat. Eiusmod pariatur officia elit ad. Ullamco adipisicing Lorem amet velit in do reprehenderit nostrud eu aute voluptate quis quis. ";

const isHorizontal = (position: Position) =>
  position === "left" || position === "right";

const getHandle = (drawer: HTMLElement) =>
  drawer.querySelector<HTMLElement>(':scope > [role="separator"]');

const readBounds = (handle: HTMLElement) => {
  const min = Number.parseFloat(handle.getAttribute("aria-valuemin") ?? "");
  const max = Number.parseFloat(handle.getAttribute("aria-valuemax") ?? "");
  return {
    min: Number.isFinite(min) ? min : 0,
    max: Number.isFinite(max) ? max : Number.POSITIVE_INFINITY,
  };
};

/** Size the drawer needs for its moving edge to sit at the given point. */
const sizeFromPoint = (
  rect: DOMRect,
  position: Position,
  x: number,
  y: number,
) => {
  switch (position) {
    case "left":
      return x - rect.left;
    case "right":
      return rect.right - x;
    case "top":
      return y - rect.top;
    default:
      return rect.bottom - y;
  }
};

/** Viewport coordinate of the moving edge for a given size. */
const edgeFromSize = (rect: DOMRect, position: Position, size: number) => {
  switch (position) {
    case "left":
      return rect.left + size;
    case "right":
      return rect.right - size;
    case "top":
      return rect.top + size;
    default:
      return rect.bottom - size;
  }
};

/** The handle's box, extended outward to the minimum target size, like the Drawer's own hit area. */
const isInHandleHitArea = (
  handle: HTMLElement,
  position: Position,
  x: number,
  y: number,
) => {
  const { left, top, right, bottom, width, height } =
    handle.getBoundingClientRect();
  const outside = Math.max(
    0,
    MIN_TARGET_SIZE - (isHorizontal(position) ? width : height),
  );
  return (
    x >= (position === "right" ? left - outside : left) &&
    x <= (position === "left" ? right + outside : right) &&
    y >= (position === "bottom" ? top - outside : top) &&
    y <= (position === "top" ? bottom + outside : bottom)
  );
};

interface ArmedState {
  rect: DOMRect;
  min: number;
  max: number;
  originSize: number;
}

interface PressState {
  pointerId: number;
  x: number;
  y: number;
  originSize: number;
}

interface UseClickToPlaceProps {
  drawer: HTMLElement | null;
  position: Position;
  open: boolean;
  preview: Preview;
  size: number;
  onSizeChange: (size: number, reason: SizeChangeReason) => void;
}

/**
 * Click the handle (without dragging) to arm resizing, then click anywhere to place the edge there.
 * The size comes from the placing click's position, so it also works for pointers without hover (touch).
 * Listeners run on `window` in the capture phase, before the Drawer's own `document` listeners and
 * Floating UI's outside-press and Escape handling, so the placing click can be fully swallowed.
 */
function useClickToPlace({
  drawer,
  position,
  open,
  preview,
  size,
  onSizeChange,
}: UseClickToPlaceProps) {
  const [armed, setArmed] = useState(false);
  const [guide, setGuide] = useState<number | null>(null);
  const armedRef = useRef<ArmedState | null>(null);
  const pressRef = useRef<PressState | null>(null);
  const swallowRef = useRef(false);
  const sizeRef = useRef(size);
  const onSizeChangeRef = useRef(onSizeChange);

  useLayoutEffect(() => {
    sizeRef.current = size;
    onSizeChangeRef.current = onSizeChange;
  });

  useEffect(() => {
    if (!open || !drawer) return;
    const targetWindow = drawer.ownerDocument.defaultView;
    if (!targetWindow) return;
    let swallowTimer: number | undefined;

    const disarm = () => {
      armedRef.current = null;
      setArmed(false);
      setGuide(null);
    };

    const cancel = () => {
      const current = armedRef.current;
      if (!current) return;
      onSizeChangeRef.current(current.originSize, "cancel");
      disarm();
    };

    const clampTo = (value: number, { min, max }: ArmedState) =>
      Math.min(Math.max(value, min), max);

    const swallow = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const refocusHandle = () =>
      getHandle(drawer)?.focus({ preventScroll: true });

    const stopSwallowing = () => {
      swallowRef.current = false;
      targetWindow.clearTimeout(swallowTimer);
    };

    const onPointerDown = (event: PointerEvent) => {
      const current = armedRef.current;
      if (current) {
        if (!event.isPrimary) return;
        swallow(event);
        const next = clampTo(
          sizeFromPoint(current.rect, position, event.clientX, event.clientY),
          current,
        );
        onSizeChangeRef.current(next, "commit");
        disarm();
        swallowRef.current = true;
        targetWindow.clearTimeout(swallowTimer);
        swallowTimer = targetWindow.setTimeout(stopSwallowing, SWALLOW_TIMEOUT);
        return;
      }

      if (!event.isPrimary) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const handle = getHandle(drawer);
      if (
        !handle ||
        !isInHandleHitArea(handle, position, event.clientX, event.clientY)
      ) {
        return;
      }
      pressRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        originSize: sizeRef.current,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const press = pressRef.current;
      if (
        press?.pointerId === event.pointerId &&
        Math.hypot(event.clientX - press.x, event.clientY - press.y) >=
          CLICK_THRESHOLD
      ) {
        // It's a drag, which the Drawer handles itself.
        pressRef.current = null;
      }

      const current = armedRef.current;
      // Touch has no hover, so it relies on the placing tap alone.
      if (!current || event.pointerType === "touch") return;
      const next = clampTo(
        sizeFromPoint(current.rect, position, event.clientX, event.clientY),
        current,
      );
      if (preview === "live") {
        onSizeChangeRef.current(next, "preview");
      } else {
        setGuide(edgeFromSize(current.rect, position, next));
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (swallowRef.current) {
        swallow(event);
        refocusHandle();
        return;
      }
      const press = pressRef.current;
      if (!press || press.pointerId !== event.pointerId) return;
      pressRef.current = null;
      const handle = getHandle(drawer);
      if (!handle) return;
      armedRef.current = {
        rect: drawer.getBoundingClientRect(),
        ...readBounds(handle),
        originSize: press.originSize,
      };
      setArmed(true);
      if (preview === "guide") {
        setGuide(
          edgeFromSize(armedRef.current.rect, position, sizeRef.current),
        );
      }
    };

    const onPointerCancel = (event: PointerEvent) => {
      if (pressRef.current?.pointerId === event.pointerId) {
        pressRef.current = null;
      }
    };

    const onMouseEvent = (event: MouseEvent) => {
      if (!swallowRef.current) return;
      swallow(event);
      if (event.type === "click") {
        stopSwallowing();
        refocusHandle();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!armedRef.current) return;
      if (event.key === "Escape") {
        swallow(event);
        cancel();
        return;
      }
      // Any other key leaves the mode, keeping the current size.
      disarm();
    };

    const onBlur = () => {
      pressRef.current = null;
      cancel();
    };

    const options = { capture: true };
    targetWindow.addEventListener("pointerdown", onPointerDown, options);
    targetWindow.addEventListener("pointermove", onPointerMove, options);
    targetWindow.addEventListener("pointerup", onPointerUp, options);
    targetWindow.addEventListener("pointercancel", onPointerCancel, options);
    targetWindow.addEventListener("mousedown", onMouseEvent, options);
    targetWindow.addEventListener("mouseup", onMouseEvent, options);
    targetWindow.addEventListener("click", onMouseEvent, options);
    targetWindow.addEventListener("keydown", onKeyDown, options);
    targetWindow.addEventListener("blur", onBlur);
    return () => {
      targetWindow.removeEventListener("pointerdown", onPointerDown, options);
      targetWindow.removeEventListener("pointermove", onPointerMove, options);
      targetWindow.removeEventListener("pointerup", onPointerUp, options);
      targetWindow.removeEventListener(
        "pointercancel",
        onPointerCancel,
        options,
      );
      targetWindow.removeEventListener("mousedown", onMouseEvent, options);
      targetWindow.removeEventListener("mouseup", onMouseEvent, options);
      targetWindow.removeEventListener("click", onMouseEvent, options);
      targetWindow.removeEventListener("keydown", onKeyDown, options);
      targetWindow.removeEventListener("blur", onBlur);
      targetWindow.clearTimeout(swallowTimer);
      armedRef.current = null;
      pressRef.current = null;
      swallowRef.current = false;
      setArmed(false);
      setGuide(null);
    };
  }, [open, drawer, position, preview]);

  // Show the resize cursor everywhere while armed, over any element's own cursor.
  useEffect(() => {
    if (!armed || !drawer) return;
    const style = drawer.ownerDocument.createElement("style");
    style.textContent = `*, *:hover { cursor: ${
      isHorizontal(position) ? "ew-resize" : "ns-resize"
    } !important; }`;
    drawer.ownerDocument.head.appendChild(style);
    return () => style.remove();
  }, [armed, drawer, position]);

  return { armed, guide };
}

const CloseButton = ({
  onClick,
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) => (
  <Button aria-label="Close drawer" appearance="transparent" onClick={onClick}>
    <CloseIcon aria-hidden />
  </Button>
);

interface ClickToPlaceArgs {
  position: Position;
}

const ClickToPlaceTemplate = ({
  position,
  preview,
}: ClickToPlaceArgs & { preview: Preview }) => {
  const horizontal = isHorizontal(position);
  const defaultSize = horizontal ? 320 : 280;
  const [open, setOpen] = useState(false);
  const [drawer, setDrawer] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState(defaultSize);
  const [lastPlaced, setLastPlaced] = useState<number | null>(null);
  const [contentClicks, setContentClicks] = useState(0);

  const { armed, guide } = useClickToPlace({
    drawer,
    position,
    open,
    preview,
    size,
    onSizeChange: (next, reason) => {
      setSize(next);
      if (reason === "commit") setLastPlaced(next);
    },
  });

  const guideLine =
    guide !== null && drawer
      ? createPortal(
          <div
            aria-hidden
            className={`demoClickToPlace-guide ${
              horizontal
                ? "demoClickToPlace-guide-vertical"
                : "demoClickToPlace-guide-horizontal"
            }`}
            style={horizontal ? { left: guide } : { top: guide }}
          />,
          drawer.ownerDocument.body,
        )
      : null;

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer
        ref={setDrawer}
        resizable
        position={position}
        open={open}
        onOpenChange={setOpen}
        size={size}
        onResize={(_event, next) => setSize(next)}
        className={armed ? "demoClickToPlace-armed" : undefined}
        style={
          horizontal
            ? { minWidth: 200, maxWidth: 640 }
            : { minHeight: 160, maxHeight: 520 }
        }
      >
        <DrawerHeader
          header={
            preview === "live"
              ? "Click to place (live preview)"
              : "Click to place (guide line)"
          }
          description="Click the edge once, move, then click where the edge should go. Press Escape to cancel. Dragging and the arrow keys still work."
          actions={<CloseButton onClick={() => setOpen(false)} />}
        />
        <DrawerContent>
          <StackLayout>
            <Text aria-live="polite">
              {armed
                ? "Resizing: click where the edge should go, or press Escape to cancel."
                : `Size: ${Math.round(size)}px`}
            </Text>
            <Text>
              Last placed by click:{" "}
              {lastPlaced === null ? "none" : `${Math.round(lastPlaced)}px`}
            </Text>
            <div>
              <Button onClick={() => setContentClicks((count) => count + 1)}>
                Content action
              </Button>
            </div>
            <Text>
              Content action clicked {contentClicks} time
              {contentClicks === 1 ? "" : "s"}. Placing the edge on this button
              shouldn't click it.
            </Text>
            <Text>{loremText.repeat(3)}</Text>
          </StackLayout>
        </DrawerContent>
        <DrawerFooter>
          <Button
            sentiment="accented"
            appearance="bordered"
            onClick={() => setSize(defaultSize)}
          >
            Reset size
          </Button>
          <Button sentiment="accented" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DrawerFooter>
      </Drawer>
      {guideLine}
    </>
  );
};

const positionArgTypes: ArgTypes<ClickToPlaceArgs> = {
  position: {
    control: "radio",
    options: ["left", "right", "top", "bottom"],
  },
};

/**
 * Option #1: click the handle, then click where the edge should go. The drawer follows the pointer in
 * between (mouse and pen only). On touch, tap the handle, then tap the destination.
 */
export const ClickToPlace: StoryFn<ClickToPlaceArgs> = ({ position }) => (
  <ClickToPlaceTemplate key={position} position={position} preview="live" />
);
ClickToPlace.args = { position: "left" };
ClickToPlace.argTypes = positionArgTypes;

/**
 * Same as ClickToPlace, but only a guide line follows the pointer, so the layout doesn't shift until the
 * placing click.
 */
export const ClickToPlaceGuideLine: StoryFn<ClickToPlaceArgs> = ({
  position,
}) => (
  <ClickToPlaceTemplate key={position} position={position} preview="guide" />
);
ClickToPlaceGuideLine.args = { position: "left" };
ClickToPlaceGuideLine.argTypes = positionArgTypes;
