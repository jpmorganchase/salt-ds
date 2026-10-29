import { useViewport, ViewportContext, ViewportProvider } from "@salt-ds/core";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

const NativeResizeObserver = globalThis.ResizeObserver;
let resizeObserverSpy: ReturnType<typeof vi.fn>;
// Strict Mode runs effects an extra time in development, so count the
// observers that are still connected rather than the ones created.
let connectedObservers = 0;

function TestComponent({
  onViewportWidthChange,
}: {
  onViewportWidthChange?: (width: number) => void;
}) {
  const width = useViewport();
  useEffect(
    () => onViewportWidthChange?.(width),
    [width, onViewportWidthChange],
  );
  return <div>{width}</div>;
}

beforeEach(() => {
  connectedObservers = 0;
  resizeObserverSpy = vi.fn(function ResizeObserverSpy(
    callback: ResizeObserverCallback,
  ) {
    const observer = new NativeResizeObserver(callback);
    connectedObservers += 1;
    const disconnect = observer.disconnect.bind(observer);
    observer.disconnect = () => {
      connectedObservers -= 1;
      disconnect();
    };
    return observer;
  });
  vi.stubGlobal(
    "ResizeObserver",
    resizeObserverSpy as unknown as typeof ResizeObserver,
  );
});
afterEach(async () => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  await page.viewport(1280, 1024);
});

describe("Given a ViewportProvider", () => {
  it("returns the current viewport width", async () => {
    await page.viewport(550, 750);
    await render(
      <ViewportProvider>
        <TestComponent />
      </ViewportProvider>,
    );
    await expect.element(page.getByText("550")).toBeInTheDocument();

    await page.viewport(650, 750);
    await expect.element(page.getByText("650")).toBeInTheDocument();
  });

  it("creates one ResizeObserver without a parent provider", async () => {
    await render(<ViewportProvider />);
    expect(connectedObservers).toBe(1);
  });

  it("reuses the parent provider ResizeObserver", async () => {
    await render(
      <ViewportProvider>
        <ViewportProvider />
      </ViewportProvider>,
    );
    expect(connectedObservers).toBe(1);
  });

  it.each([100, 0])("does not observe when context is %i", async (value) => {
    await render(
      <ViewportContext.Provider value={value}>
        <ViewportProvider />
      </ViewportContext.Provider>,
    );
    expect(resizeObserverSpy).not.toHaveBeenCalled();
  });

  it("observes when context is null", async () => {
    await render(
      <ViewportContext.Provider value={null}>
        <ViewportProvider />
      </ViewportContext.Provider>,
    );
    expect(connectedObservers).toBe(1);
  });

  it("initializes from the body width", async () => {
    const onViewportWidthChange = vi.fn();
    vi.spyOn(document.body, "getBoundingClientRect").mockReturnValue({
      width: 1000,
    } as DOMRect);
    await render(
      <ViewportProvider>
        <TestComponent onViewportWidthChange={onViewportWidthChange} />
      </ViewportProvider>,
    );
    await expect
      .poll(() => onViewportWidthChange.mock.calls.flat())
      .toContain(1000);
  });
});
