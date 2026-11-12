import saltGridCSS from "@salt-ds/ag-grid-theme/salt-ag-theme.css";
import saltThemeCSS from "@salt-ds/theme/index.css";
import {
  AllCommunityModule,
  type ColDef,
  createGrid,
  type GridApi,
  ModuleRegistry,
} from "ag-grid-community";
import agGridCSS from "ag-grid-community/styles/ag-grid.css";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

// The browser build imports component CSS as strings; mount these consumer styles together.
const stylesheet = document.createElement("style");
stylesheet.textContent = `${agGridCSS}\n${saltThemeCSS}\n${saltGridCSS}`;
beforeAll(() => {
  document.head.append(stylesheet);
});
afterAll(() => {
  stylesheet.remove();
});

ModuleRegistry.registerModules([AllCommunityModule]);

type Density = "high" | "medium" | "low" | "touch";
type Content = "normal" | "mixed" | "fixed" | "tall" | "empty";
interface RowData {
  value: string;
  other: string;
  contentHeight?: number;
}
interface Grid {
  provider: HTMLDivElement;
  container: HTMLDivElement;
  api: GridApi<RowData>;
  root: Element;
  rowCount: number;
}
const heights = { high: 25, medium: 37, low: 49, touch: 61 };
const mounted: Grid[] = [];
const densityChanges = [
  ["high", false],
  ["medium", false],
  ["low", false],
  ["touch", false],
  ["high", false],
  ["high", true],
  ["high", false],
] as const;

function element(parent: Element, selector: string): HTMLElement {
  const result = parent.querySelector<HTMLElement>(selector);
  if (!result) throw new Error(`Missing grid element: ${selector}`);
  return result;
}
function row(grid: Grid, index: number) {
  return element(grid.container, `.ag-row[row-index="${index}"]`);
}
function rowHeights(grid: Grid) {
  return Array.from(
    { length: grid.rowCount },
    (_, index) => row(grid, index).getBoundingClientRect().height,
  );
}
function modelHeights(grid: Grid) {
  return Array.from(
    { length: grid.rowCount },
    (_, index) => grid.api.getDisplayedRowAtIndex(index)?.rowHeight,
  );
}
const frame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

afterEach(() => {
  for (const grid of mounted.splice(0)) {
    grid.api.destroy();
    grid.provider.remove();
  }
});

async function mountGrid(mode: string, content: Content): Promise<Grid> {
  const provider = document.createElement("div");
  provider.className = "salt-theme salt-density-high";
  provider.dataset.mode = mode;
  const container = document.createElement("div");
  container.className = "ag-theme-salt";
  container.style.cssText = "height:600px;width:500px";
  provider.append(container);
  document.body.append(provider);
  // These references stay unchanged through every density and compact transition.
  const columnDefs: ColDef<RowData>[] = [
    {
      field: "value",
      width: 220,
      autoHeight: content !== "normal",
      wrapText: content !== "normal",
      cellRendererSelector: ({ data }) =>
        data?.contentHeight == null
          ? undefined
          : {
              component: () => {
                const renderer = document.createElement("div");
                renderer.style.cssText = `height:${data.contentHeight}px;line-height:14px;font-size:11px`;
                renderer.textContent = `${data.contentHeight}px content`;
                return renderer;
              },
            },
    },
    { field: "other", width: 200 },
  ];
  const textRows: RowData[] = [
    "Short text",
    "Ordinary text that wraps onto several lines to exercise auto height while its font size and line height change with Salt density.",
  ].map((value) => ({ value, other: "Normal cell" }));
  const emptyRow = { value: "", other: "Empty content" };
  const fixedRow = { value: "", other: "Small renderer", contentHeight: 14 };
  const tallRow = { value: "", other: "Tall renderer", contentHeight: 100 };
  const rowData =
    content === "mixed"
      ? [...textRows, emptyRow, fixedRow, tallRow]
      : content === "empty"
        ? [emptyRow]
        : content === "fixed"
          ? [fixedRow]
          : content === "tall"
            ? [tallRow]
            : textRows;
  const api = createGrid(container, {
    theme: "legacy",
    columnDefs,
    rowData,
    animateRows: false,
  });
  const grid = {
    provider,
    container,
    api,
    root: element(container, ".ag-root-wrapper"),
    rowCount: rowData.length,
  };
  mounted.push(grid);
  await document.fonts.ready;
  await expect.poll(() => rowHeights(grid).length).toBe(grid.rowCount);
  return grid;
}

async function setDensity(grid: Grid, density: Density, compact = false) {
  grid.provider.className = `salt-theme salt-density-${density}`;
  const className = compact ? "ag-theme-salt-compact" : "ag-theme-salt";
  if (grid.container.className !== className) {
    grid.container.className = className;
  }
  const height = compact ? 21 : heights[density];
  await expect
    .poll(
      () =>
        element(grid.container, ".ag-header-row").getBoundingClientRect()
          .height,
    )
    .toBe(height - 1);
  // Let ResizeObserver and AG Grid's auto-height debounce finish before checking rows.
  await frame();
  await frame();
  await frame();
  expect(element(grid.container, ".ag-root-wrapper")).toBe(grid.root);
  return height;
}

function expectLayout(grid: Grid) {
  expect(modelHeights(grid)).toEqual(rowHeights(grid));
  for (let index = 1; index < grid.rowCount; index++) {
    expect(row(grid, index).getBoundingClientRect().top).toBeGreaterThanOrEqual(
      row(grid, index - 1).getBoundingClientRect().bottom,
    );
  }
}

describe.each(["light", "dark"])("AG Grid density in %s mode", (mode) => {
  // Isolate fixed/empty content so another row's resize cannot mask stale minima or lost tall heights.
  it.each(["normal", "fixed", "tall", "empty"] as const)(
    "follows CSS density and compact changes with %s content",
    async (content) => {
      const grid = await mountGrid(mode, content);
      for (const [density, compact] of densityChanges) {
        const minimum = await setDensity(grid, density, compact);
        const height = content === "tall" ? 100 : minimum;
        await expect
          .poll(() => rowHeights(grid))
          .toEqual(Array(grid.rowCount).fill(height));
        expectLayout(grid);
      }
    },
  );

  it("resizes mixed auto-height rows while preserving taller content", async () => {
    const grid = await mountGrid(mode, "mixed");
    let wrappedHighHeight = 0;
    for (const [density, compact] of densityChanges) {
      const minimum = await setDensity(grid, density, compact);
      await expect
        .poll(() => {
          const actual = rowHeights(grid);
          return [actual[0], actual[2], actual[3], actual[4]];
        })
        .toEqual([minimum, minimum, minimum, 100]);
      await expect.poll(() => rowHeights(grid)[1]).toBeGreaterThan(minimum);
      await expect
        .poll(() => {
          const wrapper = element(
            row(grid, 1),
            '[col-id="value"] .ag-cell-wrapper',
          );
          return rowHeights(grid)[1] >= wrapper.getBoundingClientRect().height;
        })
        .toBe(true);
      if (density === "high") {
        if (wrappedHighHeight) {
          await expect.poll(() => rowHeights(grid)[1]).toBe(wrappedHighHeight);
        } else {
          wrappedHighHeight = rowHeights(grid)[1];
        }
      } else if (density === "touch") {
        expect(rowHeights(grid)[1]).toBeGreaterThan(wrappedHighHeight);
      }
      expectLayout(grid);
    }
  });
});
