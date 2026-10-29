import { SaltProvider } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as gridStories from "~stories/grid-layout/grid-layout.stories";

const composedStories = composeStories(gridStories);
const { Default, Nested } = composedStories;

function grids() {
  return Array.from(document.querySelectorAll<HTMLElement>(".saltGridLayout"));
}

function trackCount(value: string) {
  return value.trim().split(/\s+/).length;
}

function expectTracks(grid: HTMLElement, columns: number, rows: number) {
  const style = getComputedStyle(grid);
  expect(trackCount(style.gridTemplateColumns)).toBe(columns);
  expect(trackCount(style.gridTemplateRows)).toBe(rows);
}

afterEach(() => page.viewport(1280, 1024));

describe("GIVEN a GridLayout", () => {
  checkAccessibility(composedStories);

  it("renders twelve columns and one row by default", async () => {
    await renderWithSalt(<Default columns={undefined} />);
    expectTracks(grids()[0], 12, 1);
  });

  it("renders the default gap", async () => {
    await renderWithSalt(<Default />);
    const style = getComputedStyle(grids()[0]);
    expect(style.columnGap).toBe("24px");
    expect(style.rowGap).toBe("24px");
  });

  it("does not inherit layout variables in nested items", async () => {
    await renderWithSalt(<Nested />);
    const [outer, inner] = grids();
    expect(getComputedStyle(outer).columnGap).toBe("48px");
    expectTracks(outer, 2, 1);
    expect(getComputedStyle(inner).columnGap).toBe("24px");
    expectTracks(inner, 1, 2);
  });

  it("supports explicit rows and columns", async () => {
    await renderWithSalt(<Default columns={4} rows={3} />);
    expectTracks(grids()[0], 4, 3);
  });

  const columns = { xs: 1, sm: 2, md: 12, lg: 12, xl: 12 };
  const rows = { xs: 4, sm: 2, md: 4, lg: 1, xl: 1 };

  it.each([
    [1921, 12, 1],
    [961, 12, 4],
    [700, 2, 6],
    [599, 1, 12],
  ] as const)(
    "uses responsive tracks at %ipx",
    async (width, expectedColumns, expectedRows) => {
      await page.viewport(width, 900);
      await renderWithSalt(<Default columns={columns} rows={rows} />);
      expectTracks(grids()[0], expectedColumns, expectedRows);
    },
  );

  const breakpoints = { xs: 0, sm: 500, md: 860, lg: 1180, xl: 1820 };

  it.each([
    [1821, 12, 1],
    [1101, 12, 4],
    [741, 2, 6],
    [499, 1, 12],
  ] as const)(
    "uses custom breakpoint tracks at %ipx",
    async (width, expectedColumns, expectedRows) => {
      await page.viewport(width, 900);
      await renderWithSalt(
        <SaltProvider breakpoints={breakpoints}>
          <Default columns={columns} rows={rows} />
        </SaltProvider>,
      );
      expectTracks(grids()[0], expectedColumns, expectedRows);
    },
  );
});
