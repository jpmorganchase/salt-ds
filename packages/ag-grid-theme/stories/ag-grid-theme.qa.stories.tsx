import type { StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { AgGridReact } from "ag-grid-react";
import {
  Default,
  ToolPanel,
  ColumnGroup,
  ContextMenu as ContextMenuGrid,
  CustomFilter,
} from "../src/examples";

import "ag-grid-community/styles/ag-grid.css";
import "../salt-ag-theme.css";

export default {
  title: "Ag Grid/Ag Grid Theme/Ag Grid Theme QA",
  component: AgGridReact,
  parameters: {
    // Make all ag grid examples go through chromatic
    chromatic: {
      disableSnapshot: false,
      delay: 200,
      modes: {
        // Only 1 menu will appear on screen, so not using side-by-side mode
        dual: { mode: "dark", viewport: { width: 800 + 24 * 2 } },
      },
    },
  },
};

export const SingleCellFocusWithRangeSelection: StoryObj<
  typeof AgGridReact
> = () => {
  return <Default />;
};
SingleCellFocusWithRangeSelection.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Do findAll here so this will also work in `side-by-side` mode
  const azCells = await canvas.findAllByText("AZ");

  for (const cell of azCells) {
    await userEvent.click(cell);

    // classname has focus ring, which we want to snapshot, #3290
    await expect(cell).toHaveClass("ag-cell-range-single-cell");
  }
};

export const HeaderTooltip: StoryObj<typeof AgGridReact> = () => {
  // hover tirgger doesn't work in Chromatic, use focus trigger here
  return (
    <Default tooltipShowDelay={0} tooltipInteraction tooltipTrigger="focus" />
  );
};
HeaderTooltip.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Do findAll here so this will also work in `side-by-side` mode
  const headerCells = await canvas.findAllByText("Capital");

  console.log(headerCells);

  for (const cell of headerCells) {
    const gridRoot: HTMLElement = cell.closest(".ag-root-wrapper")!;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unnecessary-type-assertion
    (cell.closest(".ag-header-cell")! as HTMLElement).focus();

    // Snapshot the tooltip, mainly ensuring bg color match
    await expect(
      await within(gridRoot).findByRole("dialog", { name: "Tooltip" })
    ).toBeInTheDocument();
  }
};

export const ColumnMenuGeneral: StoryObj<typeof AgGridReact> = () => {
  return <Default />;
};
ColumnMenuGeneral.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Do findAll here so this will also work in `side-by-side` mode
  const nameHeaderCells = await canvas.findAllByText("Name");

  for (const cell of nameHeaderCells) {
    const gridRoot: HTMLElement = cell.closest(".ag-root-wrapper")!;

    await userEvent.click(
      cell
        .closest(".ag-header-cell-comp-wrapper")!
        .querySelector(".ag-icon.ag-icon-menu")!
    );

    const dialog = within(gridRoot).getByRole("dialog", {
      name: "Column Menu",
    });

    await userEvent.hover(
      within(dialog).getByRole("treeitem", { name: /Pin Column/i })
    );

    // snapshot the menu
    await expect(dialog).toBeInTheDocument();
  }
};

export const ColumnMenuFilter: StoryObj<typeof AgGridReact> = () => {
  return <Default />;
};
ColumnMenuFilter.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Do findAll here so this will also work in `side-by-side` mode
  const nameHeaderCells = await canvas.findAllByText("Name");

  for (const cell of nameHeaderCells) {
    const gridRoot: HTMLElement = cell.closest(".ag-root-wrapper")!;

    await userEvent.click(
      cell
        .closest(".ag-header-cell-comp-wrapper")!
        .querySelector(".ag-icon.ag-icon-menu")!
    );

    const dialog = within(gridRoot).getByRole("dialog", {
      name: "Column Menu",
    });

    await userEvent.click(within(dialog).getByRole("tab", { name: /filter/i }));

    const searchInput = within(dialog).getByRole("textbox", {
      name: "Search filter values",
    });
    await expect(searchInput).toBeInTheDocument();
    // Hide the caret color so snapshot will be consistant
    searchInput.style.caretColor = "transparent";

    // snapshot the menu
    await expect(dialog).toBeInTheDocument();
  }
};

export const ColumnMenuColumns: StoryObj<typeof AgGridReact> = () => {
  return <Default />;
};
ColumnMenuColumns.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Do findAll here so this will also work in `side-by-side` mode
  const nameHeaderCells = await canvas.findAllByText("Name");

  for (const cell of nameHeaderCells) {
    const gridRoot: HTMLElement = cell.closest(".ag-root-wrapper")!;

    await userEvent.click(
      cell
        .closest(".ag-header-cell-comp-wrapper")!
        .querySelector(".ag-icon.ag-icon-menu")!
    );

    const dialog = within(gridRoot).getByRole("dialog", {
      name: "Column Menu",
    });

    await userEvent.click(
      within(dialog).getByRole("tab", { name: /columns/i })
    );

    // snapshot the menu
    await expect(dialog).toBeInTheDocument();
  }
};

export const ColumnMenuNumberFilter: StoryObj<typeof AgGridReact> = () => {
  return <ColumnGroup />;
};
ColumnMenuNumberFilter.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Do findAll here so this will also work in `side-by-side` mode
  const nameHeaderCells = await canvas.findAllByText("Population");

  for (const cell of nameHeaderCells) {
    const gridRoot: HTMLElement = cell.closest(".ag-root-wrapper")!;

    await userEvent.click(
      cell
        .closest(".ag-header-cell-comp-wrapper")!
        .querySelector(".ag-icon.ag-icon-menu")!
    );

    const dialog = within(gridRoot).getByRole("dialog", {
      name: "Column Menu",
    });

    await userEvent.click(within(dialog).getByRole("tab", { name: /filter/i }));

    await userEvent.click(
      await within(dialog).findByRole("combobox", {
        name: "Filtering operator",
      })
    );

    const dropDown = within(gridRoot).getByRole("listbox", {
      name: "Select Field",
    });
    await userEvent.click(
      within(dropDown).getByRole("option", { name: "Not blank" })
    );

    // Snapshot radio buttons, which comes from icon in v31
    await expect(within(dialog).getByText("AND")).toBeInTheDocument();
    await expect(within(dialog).getByText("OR")).toBeInTheDocument();
  }
};

export const ToolPanelColumns: StoryObj<typeof AgGridReact> = () => {
  return <ToolPanel />;
};
ToolPanelColumns.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Do findAll here so this will also work in `side-by-side` mode
  const columnsTabs = await canvas.findAllByRole("tab", { name: "Columns" });

  for (const tab of columnsTabs) {
    await userEvent.click(tab);

    await expect(tab).toHaveAttribute("aria-expanded", "true");
  }
};

export const EditableCellFocus: StoryObj<typeof AgGridReact> = () => {
  return <ColumnGroup />;
};
EditableCellFocus.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Do findAll here so this will also work in `side-by-side` mode
  const alaskaPopulationCells = await canvas.findAllByText("5492139");

  for (const cell of alaskaPopulationCells) {
    await userEvent.click(cell);

    await expect(cell).toHaveClass("ag-cell-focus", "editable-cell");
  }
};

export const ContextMenu: StoryObj<typeof AgGridReact> = () => {
  return <ContextMenuGrid />;
};
ContextMenu.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Do findAll here so this will also work in `side-by-side` mode
  const azCells = await canvas.findAllByText("AZ");

  for (const cell of azCells) {
    await userEvent.pointer({ keys: "[MouseRight>]", target: cell });

    const gridRoot: HTMLElement = cell.closest(".ag-root-wrapper")!;
    await expect(
      within(gridRoot).getByRole("presentation", { name: "Context Menu" })
    ).toBeInTheDocument();
  }
};

export const FloatingFilterFocus: StoryObj<typeof AgGridReact> = () => {
  return <CustomFilter />;
};
FloatingFilterFocus.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const codeFloatingFilterInputs = await canvas.findAllByRole("textbox", {
    name: "Code Filter Input",
  });
  for (const input of codeFloatingFilterInputs) {
    await userEvent.click(input);

    // Snapshot floating input focus ring
  }
};

// Regression of #3351, icon should match Default
export const WithExtraContainerClass = () => {
  return <Default containerClassName="foo" />;
};
