import { SaltProvider } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import * as flexStories from "~stories/flex-layout/flex-layout.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(flexStories);
const { Default, Nested } = composedStories;

function layouts() {
  return Array.from(document.querySelectorAll<HTMLElement>(".saltFlexLayout"));
}

afterEach(() => page.viewport(1280, 1024));

describe("GIVEN a FlexLayout", () => {
  checkAccessibility(composedStories);

  it("renders in the row direction by default", async () => {
    await renderWithSalt(<Default />);
    expect(getComputedStyle(layouts()[0]).flexDirection).toBe("row");
  });

  it("wraps by default", async () => {
    await renderWithSalt(<Default />);
    expect(getComputedStyle(layouts()[0]).flexWrap).toBe("wrap");
  });

  it("renders the default gap", async () => {
    await renderWithSalt(<Default />);
    const style = getComputedStyle(layouts()[0]);
    expect(style.columnGap).toBe("24px");
    expect(style.rowGap).toBe("24px");
  });

  it("does not inherit layout variables in nested items", async () => {
    await renderWithSalt(<Nested />);
    const [outer, inner] = layouts().map((layout) => getComputedStyle(layout));

    expect(outer.flexWrap).toBe("wrap");
    expect(outer.justifyContent).toBe("space-between");
    expect(outer.rowGap).toBe("48px");
    expect(inner.flexWrap).toBe("nowrap");
    expect(inner.justifyContent).toBe("flex-start");
    expect(inner.rowGap).toBe("24px");
  });

  it("renders separators", async () => {
    await renderWithSalt(<Default separators wrap={false} />);
    expect(layouts()[0]).toHaveClass("saltFlexLayout-separator");
  });

  it("supports disabling wrap", async () => {
    await renderWithSalt(<Default wrap={false} />);
    expect(getComputedStyle(layouts()[0]).flexWrap).toBe("nowrap");
  });

  const wrap = { xs: true, sm: true, md: true, lg: false, xl: false };

  it.each([
    [1921, "nowrap"],
    [961, "wrap"],
    [700, "wrap"],
    [600, "wrap"],
  ] as const)("uses responsive wrap at %ipx", async (width, expected) => {
    await page.viewport(width, 900);
    await renderWithSalt(<Default wrap={wrap} />);
    expect(getComputedStyle(layouts()[0]).flexWrap).toBe(expected);
  });

  const breakpoints = { xs: 0, sm: 500, md: 860, lg: 1180, xl: 1820 };

  it.each([
    [1821, "nowrap"],
    [1101, "wrap"],
    [741, "wrap"],
    [499, "wrap"],
  ] as const)(
    "uses custom breakpoint wrapping at %ipx",
    async (width, expected) => {
      await page.viewport(width, 900);
      await renderWithSalt(
        <SaltProvider breakpoints={breakpoints}>
          <Default wrap={wrap} />
        </SaltProvider>,
      );
      expect(getComputedStyle(layouts()[0]).flexWrap).toBe(expected);
    },
  );
});
