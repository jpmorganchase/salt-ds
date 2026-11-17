import { afterEach } from "vitest";
import { cdp, commands, server } from "vitest/browser";
import { act } from "./render";

// Real pointer input for gestures `userEvent` can't express, e.g. a held press,
// touch or several fingers. Mouse input goes through Playwright and works in
// every browser. Touch input uses the Chrome DevTools Protocol, so it only works
// in Chromium; guard touch tests with `it.runIf(supportsTouch)`.

export const supportsTouch = server.browser === "chromium";

export interface Point {
  x: number;
  y: number;
}

type MouseButton = "left" | "right";

type CDPSession = {
  send(method: string, params: Record<string, unknown>): Promise<unknown>;
};

let pressedButton: MouseButton | null = null;
let lastMousePoint: Point = { x: 0, y: 0 };
let activeTouches: Point[] = [];

// Playwright and CDP take coordinates in the top-level page, but tests run
// inside an iframe.
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

async function dispatchTouch(
  type: "touchStart" | "touchMove" | "touchEnd" | "touchCancel",
  points: Point[],
) {
  if (!supportsTouch) {
    throw new Error(
      `Touch input needs Chromium, but tests are running in ${server.browser}. Guard the test with \`it.runIf(supportsTouch)\`.`,
    );
  }
  activeTouches = type === "touchEnd" || type === "touchCancel" ? [] : points;
  await act(async () => {
    await (cdp() as CDPSession).send("Input.dispatchTouchEvent", {
      type,
      touchPoints: points.map((point, id) => ({ ...toPagePoint(point), id })),
    });
  });
}

export const mouse = {
  async move(point: Point) {
    lastMousePoint = point;
    const { x, y } = toPagePoint(point);
    await act(() => commands.mouseMove(x, y));
  },
  async down(point: Point, button: MouseButton = "left") {
    await mouse.move(point);
    pressedButton = button;
    await act(() => commands.mouseDown(button));
  },
  async up(point: Point = lastMousePoint) {
    if (point.x !== lastMousePoint.x || point.y !== lastMousePoint.y) {
      await mouse.move(point);
    }
    const button = pressedButton ?? "left";
    pressedButton = null;
    await act(() => commands.mouseUp(button));
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

declare module "vitest/browser" {
  interface BrowserCommands {
    mouseMove: (x: number, y: number) => Promise<void>;
    mouseDown: (button: MouseButton) => Promise<void>;
    mouseUp: (button: MouseButton) => Promise<void>;
  }
}
