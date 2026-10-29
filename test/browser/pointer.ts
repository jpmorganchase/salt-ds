import { afterEach } from "vitest";
import { cdp } from "vitest/browser";
import { act } from "./render";

// Real pointer input via the Chrome DevTools Protocol (Chromium only), for gestures
// `userEvent` can't express, e.g. a held press, touch or several fingers.

export interface Point {
  x: number;
  y: number;
}

type MouseButton = "left" | "right";

type CDPSession = {
  send(method: string, params: Record<string, unknown>): Promise<unknown>;
};

const BUTTONS: Record<MouseButton, number> = { left: 1, right: 2 };

let pressedButton: MouseButton | null = null;
let lastMousePoint: Point = { x: 0, y: 0 };
let activeTouches: Point[] = [];

// CDP takes coordinates in the top-level page, but tests run inside an iframe.
function toPagePoint({ x, y }: Point) {
  const frame = window.frameElement as HTMLElement | null;
  if (!frame) return { x, y };
  const rect = frame.getBoundingClientRect();
  const scale = frame.offsetWidth ? rect.width / frame.offsetWidth : 1;
  return {
    x: rect.left + (frame.clientLeft + x) * scale,
    y: rect.top + (frame.clientTop + y) * scale,
  };
}

async function send(method: string, params: Record<string, unknown>) {
  await act(async () => {
    await (cdp() as CDPSession).send(method, params);
  });
}

async function dispatchMouse(
  type: "mouseMoved" | "mousePressed" | "mouseReleased",
  point: Point,
  button: MouseButton | "none",
  buttons: number,
) {
  lastMousePoint = point;
  await send("Input.dispatchMouseEvent", {
    type,
    ...toPagePoint(point),
    button,
    buttons,
    clickCount: type === "mouseMoved" ? 0 : 1,
  });
}

async function dispatchTouch(
  type: "touchStart" | "touchMove" | "touchEnd" | "touchCancel",
  points: Point[],
) {
  activeTouches = type === "touchEnd" || type === "touchCancel" ? [] : points;
  await send("Input.dispatchTouchEvent", {
    type,
    touchPoints: points.map((point, id) => ({ ...toPagePoint(point), id })),
  });
}

export const mouse = {
  async move(point: Point) {
    await dispatchMouse(
      "mouseMoved",
      point,
      pressedButton ?? "none",
      pressedButton ? BUTTONS[pressedButton] : 0,
    );
  },
  async down(point: Point, button: MouseButton = "left") {
    await mouse.move(point);
    pressedButton = button;
    await dispatchMouse("mousePressed", point, button, BUTTONS[button]);
  },
  async up(point: Point = lastMousePoint) {
    const button = pressedButton ?? "left";
    pressedButton = null;
    await dispatchMouse("mouseReleased", point, button, 0);
  },
  async click(point: Point) {
    await mouse.down(point);
    await mouse.up(point);
  },
  async drag(from: Point, to: Point) {
    await mouse.down(from);
    await mouse.move(to);
    await mouse.up(to);
  },
};

/** Each point is a finger. The first one is the primary pointer. */
export const touch = {
  async start(...points: Point[]) {
    await dispatchTouch("touchStart", points);
  },
  async move(...points: Point[]) {
    await dispatchTouch("touchMove", points);
  },
  async end() {
    await dispatchTouch("touchEnd", []);
  },
  async cancel() {
    await dispatchTouch("touchCancel", []);
  },
  async tap(point: Point) {
    await touch.start(point);
    await touch.end();
  },
};

// Release anything left pressed so it doesn't leak into the next test.
afterEach(async () => {
  if (pressedButton) await mouse.up();
  if (activeTouches.length > 0) await touch.cancel();
});
