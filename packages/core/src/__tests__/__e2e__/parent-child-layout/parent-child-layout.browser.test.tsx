import { SaltProvider } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as parentChildStories from "~stories/parent-child-layout/parent-child-layout.stories";

const { Default } = composeStories(parentChildStories);

function layout(className = ".saltParentChildLayout") {
  const element = document.querySelector(className);
  if (!element) throw new Error(`Missing parent-child layout: ${className}`);
  return element;
}

afterEach(() => page.viewport(1280, 1024));

describe("GIVEN a ParentChildLayout", () => {
  it("has no gap by default", async () => {
    await renderWithSalt(<Default />);
    expect(getComputedStyle(layout()).gap).toBe("0px");
  });

  it.each([
    [1921, "ParentChild"],
    [1920, "Child"],
  ] as const)("responds to the lg breakpoint at %ipx", async (width, text) => {
    await page.viewport(width, 900);
    await renderWithSalt(<Default collapseAtBreakpoint="lg" />);
    await expect.poll(() => layout().textContent ?? "").toContain(text);
  });

  it.each([
    [1921, "ParentChild"],
    [1920, "Child"],
  ] as const)("supports custom breakpoints at %ipx", async (width, text) => {
    await page.viewport(width, 900);
    await renderWithSalt(
      <SaltProvider
        breakpoints={{ xs: 0, sm: 960, md: 960, lg: 1800, xl: 1920 }}
      >
        <Default collapseAtBreakpoint="lg" />
      </SaltProvider>,
    );
    await expect.poll(() => layout().textContent ?? "").toContain(text);
  });

  it("shows the child by default when collapsed", async () => {
    await page.viewport(600, 900);
    await renderWithSalt(<Default />);
    await expect
      .poll(() => layout(".saltParentChildLayout-collapsed").textContent ?? "")
      .toContain("Child");
  });

  it("shows the parent when visibleView is parent", async () => {
    await page.viewport(600, 900);
    await renderWithSalt(<Default visibleView="parent" />);
    await expect
      .poll(() => layout(".saltParentChildLayout-collapsed").textContent ?? "")
      .toContain("Parent");
  });
});
