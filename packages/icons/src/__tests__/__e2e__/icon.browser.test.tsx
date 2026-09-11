import {
  BankIcon,
  BankSolidIcon,
  GithubIcon,
  Icon,
  ScheduleTimeIcon,
} from "@salt-ds/icons";
import { composeStories } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as iconStories from "~stories/icon.stories";

const composedStories = composeStories(iconStories);
const { SaltIcon } = composedStories;

const getIconPath = (testId: string) => {
  const path = page.getByTestId(testId).element().querySelector("path");
  if (!path) throw new Error(`Expected a generated path in ${testId}`);
  return path;
};

// Test actual paint: browsers may serialize a secondary CSS width as calc(...).
const expectScheduleHandWidth = (width: number) => {
  const hand = page
    .getByTestId("schedule")
    .element()
    .querySelector("path[stroke-width]") as SVGPathElement;
  expect(hand).not.toBeNull();
  if (width === 0) {
    expect(Number.parseFloat(getComputedStyle(hand).strokeWidth)).toBe(0);
    return;
  }
  expect(hand.isPointInStroke(new DOMPoint(8 + width / 2 + 0.005, 8))).toBe(
    false,
  );
  expect(hand.isPointInStroke(new DOMPoint(8 + width / 2 - 0.005, 8))).toBe(
    true,
  );
};

describe("Given an icon", () => {
  checkAccessibility(composedStories);

  it("has no image role or aria-label when aria-hidden", async () => {
    await renderWithSalt(<SaltIcon data-testid="SaltIcon" aria-hidden />);

    await expect.element(page.getByRole("img")).not.toBeInTheDocument();
    await expect
      .element(page.getByTestId("SaltIcon"))
      .not.toHaveAttribute("aria-label");
  });

  it("passes native stroke width through to custom icon paths", async () => {
    await renderWithSalt(
      <Icon
        data-testid="custom"
        aria-label="Custom line"
        viewBox="0 0 16 16"
        strokeWidth={0.8}
      >
        <path d="M2 8H14" fill="none" stroke="currentColor" />
      </Icon>,
    );

    expect(getComputedStyle(getIconPath("custom")).strokeWidth).toBe("0.8px");
  });
  it.each([0, 1])(
    "keeps generated stroke control separate from native inherited width %s",
    async (strokeWidth) => {
      await renderWithSalt(
        <>
          <BankIcon data-testid="outline" strokeWidth={strokeWidth} />
          <BankSolidIcon data-testid="solid" strokeWidth={strokeWidth} />
        </>,
      );

      const outlineStyle = getComputedStyle(getIconPath("outline"));
      expect(outlineStyle.strokeWidth).toBe("1.5px");
      expect(outlineStyle.stroke).not.toBe("none");
      expect(outlineStyle.fill).toBe("none");
      const solidStyle = getComputedStyle(getIconPath("solid"));
      expect(solidStyle.fill).not.toBe("none");
      expect(solidStyle.stroke).toBe("none");
    },
  );

  it.each([0, 0.67, 1.25])(
    "scales primary and secondary strokes with an inherited width of %s",
    async (strokeWidth) => {
      await renderWithSalt(
        <div style={{ "--saltIcon-strokeWidth": strokeWidth } as CSSProperties}>
          <BankIcon data-testid="outline" />
          <BankSolidIcon data-testid="solid" />
          <ScheduleTimeIcon data-testid="schedule" />
          <GithubIcon data-testid="brand" />
        </div>,
      );

      expect(
        Number.parseFloat(getComputedStyle(getIconPath("outline")).strokeWidth),
      ).toBeCloseTo(strokeWidth, 4);
      expect(getComputedStyle(getIconPath("solid")).fill).not.toBe("none");
      expect(getComputedStyle(getIconPath("solid")).stroke).toBe("none");
      expect(getComputedStyle(getIconPath("brand")).stroke).toBe("none");
      expect(
        Number.parseFloat(
          getComputedStyle(getIconPath("schedule")).strokeWidth,
        ),
      ).toBeCloseTo(strokeWidth, 4);
      expectScheduleHandWidth(strokeWidth * 0.72);
    },
  );

  it("uses the size foundation and lets a local icon override it", async () => {
    await renderWithSalt(
      <div
        data-testid="scope"
        style={{ "--salt-size-icon-strokeWidth": 1.25 } as CSSProperties}
      >
        <BankIcon data-testid="inherited" />
        <BankIcon
          data-testid="local"
          style={{ "--saltIcon-strokeWidth": 0.8 } as CSSProperties}
        />
      </div>,
    );

    expect(getComputedStyle(getIconPath("inherited")).strokeWidth).toBe(
      "1.25px",
    );
    expect(getComputedStyle(getIconPath("local")).strokeWidth).toBe("0.8px");
    (page.getByTestId("scope").element() as HTMLElement).style.setProperty(
      "--salt-size-icon-strokeWidth",
      "1.5",
    );
    expect(getComputedStyle(getIconPath("inherited")).strokeWidth).toBe(
      "1.5px",
    );
    expect(getComputedStyle(getIconPath("local")).strokeWidth).toBe("0.8px");
  });

  it.each([
    ["primary", "rgb(10, 20, 30)"],
    ["secondary", "rgb(40, 50, 60)"],
  ] as const)(
    "applies %s color to outlines and solids",
    async (color, expected) => {
      await renderWithSalt(
        <div
          style={
            {
              color: "rgb(90, 100, 110)",
              "--salt-content-primary-foreground": "rgb(10, 20, 30)",
              "--salt-content-secondary-foreground": "rgb(40, 50, 60)",
            } as CSSProperties
          }
        >
          <BankIcon data-testid="outline" color={color} />
          <BankSolidIcon data-testid="solid" color={color} />
        </div>,
      );

      expect(getComputedStyle(getIconPath("outline")).stroke).toBe(expected);
      expect(getComputedStyle(getIconPath("solid")).fill).toBe(expected);
    },
  );

  it("applies a custom icon color to both generated variants", async () => {
    await renderWithSalt(
      <div
        style={
          {
            color: "rgb(90, 100, 110)",
            "--saltIcon-color": "rgb(27, 87, 144)",
          } as CSSProperties
        }
      >
        <BankIcon data-testid="outline" />
        <BankSolidIcon data-testid="solid" />
      </div>,
    );

    expect(getComputedStyle(getIconPath("outline")).stroke).toBe(
      "rgb(27, 87, 144)",
    );
    expect(getComputedStyle(getIconPath("solid")).fill).toBe(
      "rgb(27, 87, 144)",
    );
  });
});
