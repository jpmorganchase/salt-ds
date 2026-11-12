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
type Content = "normal" | "wrapped" | "fixed" | "empty";
interface RowData {
  value: string;
  other: string;
}
interface Grid {
  provider: HTMLDivElement;
  container: HTMLDivElement;
  api: GridApi<RowData>;
  root: Element;
}
const heights = { high: 25, medium: 37, low: 49, touch: 61 };
const mounted: Grid[] = [];

function element(parent: Element, selector: string): HTMLElement {
  const result = parent.querySelector<HTMLElement>(selector);
  if (!result) throw new Error(`Missing grid element: ${selector}`);
  return result;
}
function row(grid: Grid, index: number) {
  return element(grid.container, `.ag-row[row-index="${index}"]`);
}
function rowHeights(grid: Grid) {
  return [0, 1].map((index) => row(grid, index).getBoundingClientRect().height);
}
function modelHeights(grid: Grid) {
  return [0, 1].map(
    (index) => grid.api.getDisplayedRowAtIndex(index)?.rowHeight,
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
  container.style.cssText = "height:450px;width:500px";
  provider.append(container);
  document.body.append(provider);
  // These references stay unchanged through every density and compact transition.
  const columnDefs: ColDef<RowData>[] = [
    {
      field: "value",
      width: 220,
      autoHeight: content !== "normal",
      wrapText: content !== "normal",
      ...(content === "fixed"
        ? {
            cellRenderer: () => {
              const renderer = document.createElement("div");
              renderer.style.cssText =
                "height:14px;line-height:14px;font-size:11px";
              renderer.textContent = "Fixed height";
              return renderer;
            },
          }
        : {}),
    },
    { field: "other", width: 200 },
  ];
  const rowData = [
    "Short text",
    "Ordinary text that wraps onto several lines to exercise auto height while its font size and line height change with Salt density.",
  ].map((value) => ({
    value: content === "empty" ? "" : value,
    other: "Normal cell",
  }));
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
  };
  mounted.push(grid);
  await document.fonts.ready;
  await expect.poll(() => rowHeights(grid).length).toBe(2);
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

async function expectRows(grid: Grid, height: number) {
  await expect.poll(() => rowHeights(grid)).toEqual([height, height]);
  expect(modelHeights(grid)).toEqual([height, height]);
}

describe.each(["light", "dark"])("AG Grid density in %s mode", (mode) => {
  it("follows CSS density and compact changes without recreating the grid", async () => {
    const grid = await mountGrid(mode, "normal");
    for (const density of ["high", "medium", "low", "touch", "high"] as const) {
      await expectRows(grid, await setDensity(grid, density));
    }
    await expectRows(grid, await setDensity(grid, "high", true));
    await expectRows(grid, await setDensity(grid, "high"));
  });

  it("resizes short and wrapped auto-height cells when density changes", async () => {
    const grid = await mountGrid(mode, "wrapped");
    let highHeight = 0;
    for (const density of ["high", "medium", "low", "touch", "high"] as const) {
      const minimum = await setDensity(grid, density);
      await expect.poll(() => rowHeights(grid)[0]).toBe(minimum);
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
        if (highHeight) {
          await expect.poll(() => rowHeights(grid)[1]).toBe(highHeight);
        } else {
          highHeight = rowHeights(grid)[1];
        }
      } else if (density === "touch") {
        expect(rowHeights(grid)[1]).toBeGreaterThan(highHeight);
      }
      expect(modelHeights(grid)).toEqual(rowHeights(grid));
      expect(row(grid, 1).getBoundingClientRect().top).toBeGreaterThanOrEqual(
        row(grid, 0).getBoundingClientRect().bottom,
      );
    }
  });

  it.each(["fixed", "empty"] as const)(
    "supports reactive rowHeight with %s auto-height content",
    async (content) => {
      const grid = await mountGrid(mode, content);
      await expectRows(grid, 25);
      // The explicit height must recover rows after CSS-only density changes.
      for (const [density, compact] of [
        ["high", false],
        ["touch", false],
        ["high", false],
        ["high", true],
      ] as const) {
        await setDensity(grid, density, compact);
      }
      // Fixed or empty content may not trigger an auto-height ResizeObserver update.
      // An explicit reactive height must still update the existing row model.
      grid.api.setGridOption("rowHeight", 21);
      await expectRows(grid, 21);
      for (const [density, compact] of [
        ["high", false],
        ["touch", false],
        ["high", false],
        ["high", true],
        ["high", false],
      ] as const) {
        const height = await setDensity(grid, density, compact);
        grid.api.setGridOption("rowHeight", height);
        await expectRows(grid, height);
      }
    },
  );
});
