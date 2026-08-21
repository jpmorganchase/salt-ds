import { platform } from "@floating-ui/dom";
import type { Platform } from "@floating-ui/react";
import {
  Button,
  FloatingPlatformProvider,
  StackLayout,
  Tooltip,
} from "@salt-ds/core";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import {
  CustomFloatingComponentProvider,
  FLOATING_TEST_ID,
} from "../../packages/core/src/__tests__/__e2e__/common";
import { renderWithSalt } from "../render";

const TOOLTIP_TEXT = "I am a tooltip";

function TestComponent() {
  return (
    <CustomFloatingComponentProvider>
      <Tooltip content={TOOLTIP_TEXT} open>
        <Button>I am a button</Button>
      </Tooltip>
    </CustomFloatingComponentProvider>
  );
}

describe("Given a floating component in a CustomFloatingComponentProvider", () => {
  it("should render the Floating Component as the root", async () => {
    await renderWithSalt(<TestComponent />);
    await expect
      .element(page.getByTestId(FLOATING_TEST_ID))
      .toBeInTheDocument();
  });

  it("should be passed the top and left props", async () => {
    await renderWithSalt(<TestComponent />);
    const floating = page.getByTestId(FLOATING_TEST_ID);
    await expect.element(floating).toHaveAttribute("data-top");
    await expect.element(floating).toHaveAttribute("data-left");
  });

  it("should be passed the position prop", async () => {
    await renderWithSalt(<TestComponent />);
    await expect
      .element(page.getByTestId(FLOATING_TEST_ID))
      .toHaveAttribute("data-position");
  });

  it("should be passed the width and height props", async () => {
    const testSize = 200;
    await renderWithSalt(
      <CustomFloatingComponentProvider>
        <Tooltip
          content={
            <div style={{ minWidth: testSize, minHeight: testSize }}>
              {TOOLTIP_TEXT}
            </div>
          }
          open
        >
          <Button>I am a button</Button>
        </Tooltip>
      </CustomFloatingComponentProvider>,
    );

    const floating = page.getByTestId(FLOATING_TEST_ID);
    await expect
      .poll(async () => Number((await floating.element()).dataset.width))
      .toBeGreaterThanOrEqual(testSize);
    await expect
      .poll(async () => Number((await floating.element()).dataset.height))
      .toBeGreaterThanOrEqual(testSize);
  });
});

describe("Given a floating component in a FloatingPlaformProvider with potential middleware", () => {
  const position = 10;

  function MiddlewareComponent({ hasMiddleware }: { hasMiddleware: boolean }) {
    return (
      <FloatingPlatformProvider
        middleware={
          hasMiddleware
            ? (existingMiddleware) => [
                ...existingMiddleware,
                {
                  name: "placeAtPosition",
                  fn: () => ({ x: position, y: position }),
                },
              ]
            : undefined
        }
      >
        <CustomFloatingComponentProvider>
          <Tooltip content={TOOLTIP_TEXT} open>
            <Button>I am a button</Button>
          </Tooltip>
        </CustomFloatingComponentProvider>
      </FloatingPlatformProvider>
    );
  }

  it("shouldn't add middleware if they are not provided", async () => {
    await renderWithSalt(<MiddlewareComponent hasMiddleware={false} />);
    const floating = page.getByTestId(FLOATING_TEST_ID);
    await expect
      .poll(async () => Number((await floating.element()).dataset.top))
      .not.toBe(position);
    await expect
      .poll(async () => Number((await floating.element()).dataset.left))
      .not.toBe(position);
  });

  it("should add middleware if they are provided", async () => {
    await renderWithSalt(<MiddlewareComponent hasMiddleware />);
    const floating = page.getByTestId(FLOATING_TEST_ID);
    await expect
      .poll(async () => Number((await floating.element()).dataset.top))
      .toBe(position);
    await expect
      .poll(async () => Number((await floating.element()).dataset.left))
      .toBe(position);
  });
});

describe("Given a floating component in a FloatingPlaformProvider with animationFrame updates", () => {
  function AnimationFrameComponent({
    animationFrame,
  }: {
    animationFrame: boolean;
  }) {
    const [isMoved, setIsMoved] = useState(false);
    return (
      <FloatingPlatformProvider animationFrame={animationFrame}>
        <CustomFloatingComponentProvider>
          {isMoved && <h1>Some other content</h1>}
          <Tooltip content={TOOLTIP_TEXT} open>
            <Button onClick={() => setIsMoved(true)}>Add More Content</Button>
          </Tooltip>
        </CustomFloatingComponentProvider>
      </FloatingPlatformProvider>
    );
  }

  it("should update on animationFrame when animationFrame is true", async () => {
    await renderWithSalt(<AnimationFrameComponent animationFrame />);
    const floating = page.getByTestId(FLOATING_TEST_ID);
    await expect.element(floating).toHaveAttribute("data-top");
    const element = await floating.element();
    const top = Number(element.dataset.top);
    const left = Number(element.dataset.left);

    await page.getByRole("button").click();
    await expect
      .poll(async () => Number((await floating.element()).dataset.top))
      .not.toBe(top);
    await expect
      .poll(async () => Number((await floating.element()).dataset.left))
      .not.toBe(left);
  });
});

describe("Given a floating component in a FloatingPlaformProvider", () => {
  const addContentText = "Add More Content";
  const toggleTooltipText = "Toggle Tooltip";

  function ReopenComponent() {
    const [isOpen, setIsOpen] = useState(true);
    const [isMoved, setIsMoved] = useState(false);
    return (
      <StackLayout>
        <Button onClick={() => setIsMoved(true)}>{addContentText}</Button>
        <Button onClick={() => setIsOpen((old) => !old)}>
          {toggleTooltipText}
        </Button>
        <FloatingPlatformProvider>
          <CustomFloatingComponentProvider>
            {isMoved && <h1>Some other content</h1>}
            <Tooltip content={TOOLTIP_TEXT} open={isOpen}>
              <Button>I am a button</Button>
            </Tooltip>
          </CustomFloatingComponentProvider>
        </FloatingPlatformProvider>
      </StackLayout>
    );
  }

  it("should update position when opened", async () => {
    await renderWithSalt(<ReopenComponent />);
    const floating = page.getByTestId(FLOATING_TEST_ID);
    await expect.element(floating).toHaveAttribute("data-top");
    const element = await floating.element();
    const top = Number(element.dataset.top);
    const left = Number(element.dataset.left);

    await page.getByText(addContentText).click();
    await page.getByText(toggleTooltipText).click();
    await expect.element(floating).not.toBeInTheDocument();
    await page.getByText(toggleTooltipText).click();
    await expect
      .poll(async () => Number((await floating.element()).dataset.top))
      .not.toBe(top);
    await expect
      .poll(async () => Number((await floating.element()).dataset.left))
      .not.toBe(left);
  });
});

describe("Given a floating component with a FloatingPlatformProvider and custom floating platform", () => {
  const customPlatform: Platform = {
    ...platform,
    async getElementRects(data) {
      const result = await platform.getElementRects(data);
      return {
        ...result,
        reference: { ...result.reference, y: 0, height: 0 },
        floating: { ...result.floating, x: 0, y: 0 },
      };
    },
    getDimensions: platform.getDimensions,
    getClippingRect: platform.getClippingRect,
  };

  it("should use the custom floating platform", async () => {
    await renderWithSalt(
      <FloatingPlatformProvider platform={customPlatform}>
        <CustomFloatingComponentProvider>
          <Tooltip content={TOOLTIP_TEXT} open>
            <Button>I am a button</Button>
          </Tooltip>
        </CustomFloatingComponentProvider>
      </FloatingPlatformProvider>,
    );
    const floating = page.getByTestId(FLOATING_TEST_ID);
    await expect
      .poll(async () => Number((await floating.element()).dataset.top))
      .toBe(0);
  });
});
