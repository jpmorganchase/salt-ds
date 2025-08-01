import type { StoryObj } from "@storybook/react-vite";
import { AgGridReact } from "ag-grid-react";
import { expect, userEvent, within } from "storybook/test";
import {
  ColumnGroup,
  ContextMenu as ContextMenuGrid,
  CustomFilter,
  Default,
  ProvidedCellEditors,
  ToolPanel,
  VariantZebra,
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
    test: {
      // This is needed to avoid AG Grid's license check failing the tests.
      dangerouslyIgnoreUnhandledErrors: true,
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

  for (const cell of headerCells) {
    const gridRoot: HTMLElement = cell.closest(".ag-root-wrapper")!;

    cell.closest<HTMLElement>(".ag-header-cell")?.focus();

    // Snapshot the tooltip, mainly ensuring bg color match
    await expect(
      await within(gridRoot).findByRole("dialog", { name: "Tooltip" }),
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
        .querySelector(".ag-icon.ag-icon-menu-alt")!,
    );

    const menu = within(gridRoot).getByRole("presentation", {
      name: "Column Menu",
    });

    await userEvent.hover(
      within(menu).getByRole("treeitem", { name: /Pin Column/i }),
    );

    // snapshot the menu
    await expect(menu).toBeInTheDocument();
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
        .querySelector(".ag-icon.ag-icon-filter")!,
    );

    const menu = within(gridRoot).getByRole("presentation", {
      name: "Column Filter",
    });

    const searchInput = within(menu).getByRole("textbox", {
      name: "Search filter values",
    });
    await expect(searchInput).toBeInTheDocument();
    // Hide the caret color so snapshot will be consistant
    searchInput.style.caretColor = "transparent";

    // snapshot the menu
    await expect(menu).toBeInTheDocument();
  }
};
export const ColumnMenuFilterFiltered: StoryObj<typeof AgGridReact> = () => {
  return <Default />;
};

ColumnMenuFilterFiltered.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Do findAll here so this will also work in `side-by-side` mode
  const nameHeaderCells = await canvas.findAllByText("Name");

  for (const cell of nameHeaderCells) {
    const gridRoot: HTMLElement = cell.closest(".ag-root-wrapper")!;

    await userEvent.click(
      cell
        .closest(".ag-header-cell-comp-wrapper")!
        .querySelector(".ag-icon.ag-icon-filter")!,
    );

    const menu = within(gridRoot).getByRole("presentation", {
      name: "Column Filter",
    });

    const alaskaOption = await within(menu).findByRole("option", {
      name: /Alaska/,
    });

    await userEvent.click(within(alaskaOption).getByText("Alaska"));

    await expect(within(alaskaOption).getByRole("checkbox")).not.toBeChecked();

    await userEvent.click(
      within(menu).getByRole("button", {
        name: /Apply/,
      }),
    );

    await userEvent.click(within(gridRoot).getByText(/Total Rows/));

    await expect(menu).not.toBeInTheDocument();

    const nameHeader = canvas.getByRole("columnheader", { name: "Name" });

    await userEvent.click(within(nameHeader).getByText("Name"));
    await expect(nameHeader).toHaveAttribute("aria-sort", "ascending");

    await userEvent.click(within(gridRoot).getByText(/Total Rows/));
    // Capture active filter, sorted header
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
        .querySelector(".ag-icon.ag-icon-menu-alt")!,
    );

    const menu = within(gridRoot).getByRole("presentation", {
      name: "Column Menu",
    });

    await userEvent.click(
      within(menu).getByRole("treeitem", { name: /Choose Column/i }),
    );

    const columnDialog = await within(gridRoot).findByRole("dialog", {
      name: "Choose Columns",
    });

    // snapshot the menu dialog
    await expect(columnDialog).toBeInTheDocument();
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
        .querySelector(".ag-icon.ag-icon-filter")!,
    );

    const menu = within(gridRoot).getByRole("presentation", {
      name: "Column Filter",
    });

    await userEvent.click(
      await within(menu).findByRole("combobox", {
        name: "Filtering operator",
      }),
    );

    const dropDown = within(gridRoot).getByRole("listbox", {
      name: "Select Field",
    });
    await userEvent.click(
      within(dropDown).getByRole("option", { name: "Not blank" }),
    );

    // Snapshot radio buttons, which comes from icon in v31
    await expect(within(menu).getByText("AND")).toBeInTheDocument();
    await expect(within(menu).getByText("OR")).toBeInTheDocument();
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

export const EditableCellLongTextFocus: StoryObj<typeof AgGridReact> = () => {
  return <ProvidedCellEditors />;
};
EditableCellLongTextFocus.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Wait until the grid fully loaded
  await sleep(200);

  // Do findAll here so this will also work in `side-by-side` mode
  const textEditorCells = await canvas.findAllByText(/Lorem ipsum/);

  for (const cell of textEditorCells) {
    await userEvent.click(cell);

    await expect(cell).toHaveClass(
      "ag-cell-not-inline-editing",
      "editable-cell",
    );
    // Tests focus style of long text, it should still be truncated
  }
};

// Function to emulate pausing between interactions
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const EditableCellEditing: StoryObj<typeof AgGridReact> = () => {
  return <ProvidedCellEditors />;
};
EditableCellEditing.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Wait until the grid fully loaded
  await sleep(200);

  // Do findAll here so this will also work in `side-by-side` mode
  const textEditorCells = await canvas.findAllByText("USD");

  for (const cell of textEditorCells) {
    await userEvent.dblClick(cell);

    await expect(cell).toHaveClass("ag-cell-inline-editing", "editable-cell");
    await expect(await within(cell).findByRole("textbox")).toHaveClass(
      "ag-input-field-input",
    );
  }
};

export const EditableCellLongTextEditing: StoryObj<typeof AgGridReact> = () => {
  return <ProvidedCellEditors />;
};
EditableCellLongTextEditing.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Wait until the grid fully loaded
  await sleep(200);

  // Do findAll here so this will also work in `side-by-side` mode
  const textEditorCells = await canvas.findAllByText(/Lorem ipsum/);

  for (const cell of textEditorCells) {
    await userEvent.dblClick(cell);

    await expect(
      await canvas.findByRole("textbox", { name: "Input Editor" }),
    ).toHaveClass("ag-input-field-input", "ag-text-area-input");
  }
};

export const EditableCellSelectEditing: StoryObj<typeof AgGridReact> = () => {
  return <ProvidedCellEditors />;
};
EditableCellSelectEditing.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Wait until the grid fully loaded
  await sleep(200);

  // Do findAll here so this will also work in `side-by-side` mode
  const textEditorCells = await canvas.findAllByText("English");

  for (const cell of textEditorCells) {
    await userEvent.dblClick(cell);
    // Editor will render a different value in the editor, not the same "cell"
    await userEvent.click(await within(cell).findByText("English"));

    await expect(cell).toHaveClass("ag-cell-inline-editing", "editable-cell");
    await expect(await canvas.findByRole("listbox")).toHaveClass(
      "ag-select-list",
    );
  }
};

export const EditableCellRichSelectEditing: StoryObj<
  typeof AgGridReact
> = () => {
  return <ProvidedCellEditors />;
};
EditableCellRichSelectEditing.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Wait until the grid fully loaded
  await sleep(200);

  // Do findAll here so this will also work in `side-by-side` mode
  const textEditorCells = await canvas.findAllByText("Black");

  for (const cell of textEditorCells) {
    await userEvent.dblClick(cell);

    await expect(cell).toHaveClass("ag-cell-inline-editing", "editable-cell");
    await expect(await canvas.findByRole("listbox")).toHaveClass(
      "ag-rich-select-virtual-list-container",
    );
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
      within(gridRoot).getByRole("presentation", { name: "Context Menu" }),
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

    await userEvent.type(input, "A");
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();

    // Rows will animate due to filter
    await sleep(500);
    // Snapshot floating input focus ring & active button in first column
  }
};

// Regression of #3351, icon should match Default
export const WithExtraContainerClass = () => {
  return <Default containerClassName="foo" />;
};

// Regression of #5056, zebra variant row selection border color
export const ZebraVariantRowSelection: StoryObj<typeof AgGridReact> = () => {
  return <VariantZebra />;
};
ZebraVariantRowSelection.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Do findAll here so this will also work in `side-by-side` mode
  const rows = await canvas.findAllByRole("row");

  // Filter to find the element with the attribute `row-index="5"`
  const fifthRows = rows.find((row) => row.getAttribute("row-index") === "5");
  if (fifthRows) {
    await userEvent.click(within(fifthRows).getByRole("checkbox"));
  }
};
