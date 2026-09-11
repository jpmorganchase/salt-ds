import {
  BankIcon,
  BankSolidIcon,
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

describe("Given an icon", () => {
  checkAccessibility(composedStories);

  it("has no image role or aria-label when aria-hidden", async () => {
    await renderWithSalt(<SaltIcon data-testid="SaltIcon" aria-hidden />);

    await expect.element(page.getByRole("img")).not.toBeInTheDocument();
    await expect
      .element(page.getByTestId("SaltIcon"))
      .not.toHaveAttribute("aria-label");
  });

  it("renders the reference-weight outline without a fill", async () => {
    await renderWithSalt(<BankIcon data-testid="outline" />);

    const style = getComputedStyle(getIconPath("outline"));
    expect(style.strokeWidth).toBe("0.67px");
    expect(style.stroke).not.toBe("none");
    expect(style.fill).toBe("none");
  });

  it("preserves the authored balance of primary and secondary strokes", async () => {
    await renderWithSalt(<ScheduleTimeIcon data-testid="schedule" />);

    const paths = page
      .getByTestId("schedule")
      .element()
      .querySelectorAll("path");
    const widths = Array.from(paths, (path) =>
      Number.parseFloat(getComputedStyle(path).strokeWidth),
    );

    expect(Math.max(...widths)).toBeCloseTo(0.67, 4);
    expect(Math.min(...widths)).toBeCloseTo(0.4824, 4);
  });
  it("passes native stroke width through to custom icon paths", async () => {
    await renderWithSalt(
      <Icon
        data-testid="custom"
        aria-label="Custom line"
        viewBox="0 0 16 16"
        strokeWidth={1.5}
      >
        <path d="M2 8H14" fill="none" stroke="currentColor" />
      </Icon>,
    );

    expect(getComputedStyle(getIconPath("custom")).strokeWidth).toBe("1.5px");
  });
  it.each([0, 1.5])(
    "keeps generated artwork fixed when inherited stroke width is %s",
    async (strokeWidth) => {
      await renderWithSalt(
        <>
          <BankIcon data-testid="outline" strokeWidth={strokeWidth} />
          <BankSolidIcon data-testid="solid" strokeWidth={strokeWidth} />
        </>,
      );

      const outlineStyle = getComputedStyle(getIconPath("outline"));
      expect(outlineStyle.strokeWidth).toBe("0.67px");
      expect(outlineStyle.stroke).not.toBe("none");
      expect(outlineStyle.fill).toBe("none");
      const solidStyle = getComputedStyle(getIconPath("solid"));
      expect(solidStyle.fill).not.toBe("none");
      expect(solidStyle.stroke).toBe("none");
    },
  );

  it.each([0, 1.5])(
    "ignores the former stroke width variable set to %s",
    async (strokeWidth) => {
      await renderWithSalt(
        <div
          style={{ "--saltIcon-stroke-width": strokeWidth } as CSSProperties}
        >
          <BankIcon data-testid="outline" />
          <BankSolidIcon data-testid="solid" />
          <ScheduleTimeIcon data-testid="schedule" />
        </div>,
      );

      expect(getComputedStyle(getIconPath("outline")).strokeWidth).toBe(
        "0.67px",
      );
      expect(getComputedStyle(getIconPath("solid")).fill).not.toBe("none");
      const paths = page
        .getByTestId("schedule")
        .element()
        .querySelectorAll("path");
      const widths = Array.from(paths, (path) =>
        Number.parseFloat(getComputedStyle(path).strokeWidth),
      );
      expect(Math.max(...widths)).toBeCloseTo(0.67, 4);
      expect(Math.min(...widths)).toBeCloseTo(0.4824, 4);
    },
  );

  it.each([1, 2])(
    "scales both variants with size=%s while retaining authored strokes",
    async (size) => {
      await renderWithSalt(
        <div style={{ "--salt-size-icon": "16px" } as CSSProperties}>
          <BankIcon data-testid="outline" size={size} />
          <BankSolidIcon data-testid="solid" size={size} />
        </div>,
      );

      for (const testId of ["outline", "solid"]) {
        const bounds = page
          .getByTestId(testId)
          .element()
          .getBoundingClientRect();
        expect(bounds.width).toBe(16 * size);
        expect(bounds.height).toBe(16 * size);
      }
      expect(getComputedStyle(getIconPath("outline")).strokeWidth).toBe(
        "0.67px",
      );
      expect(getComputedStyle(getIconPath("solid")).fill).not.toBe("none");
    },
  );
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
