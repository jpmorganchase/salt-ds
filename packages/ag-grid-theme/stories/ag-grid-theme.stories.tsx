import { AgGridReact } from "ag-grid-react";
import { userEvent, within, expect } from "@storybook/test";
import type { StoryObj } from "@storybook/react";
import { Default, ToolPanel } from "../src/examples";

import "ag-grid-community/styles/ag-grid.css";
import "../salt-ag-theme.css";

export default {
  title: "Ag Grid/Ag Grid Theme",
  component: AgGridReact,
  parameters: {
    // Make all ag grid examples go through chromatic
    chromatic: {
      disableSnapshot: false,
      delay: 200,
      // double default width from `useAgGridHelpers` given we're using side-by-side mode, + panel wrapper padding
      modes: {
        dual: { mode: "side-by-side", viewport: { width: 800 * 2 + 24 * 4 } },
      },
    },
  },
};

export const BasicGrid: StoryObj<typeof AgGridReact> = () => {
  return <Default />;
};
BasicGrid.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Do findAll here so this will also work in `side-by-side` mode
  const azCells = await canvas.findAllByText("AZ");

  for (const cell of azCells) {
    await userEvent.click(cell);

    // classname has focus ring, which we want to snapshot, #3290
    await expect(cell).toHaveClass("ag-cell-range-single-cell");
  }
};

export {
  CheckboxSelection,
  Coloration,
  ColumnGroup,
  ColumnSpanning,
  ContextMenu,
  CustomFilter,
  DragRowOrder,
  Icons,
  FloatingFilter,
  HDCompact,
  InfiniteScroll,
  LoadingOverlay,
  MasterDetail,
  NoDataOverlay,
  Pagination,
  ParentChildRows,
  RowGrouping,
  RowGroupPanel,
  PinnedRows,
  RangeSelection,
  SortAndFilter,
  StatusBar,
  ToolPanel,
  VariantSecondary,
  VariantZebra,
  WrappedCell,
  WrappedHeader,
} from "../src/examples";

// Regression of #3351, icon should match Default
export const WithExtraContainerClass = () => {
  return <Default containerClassName="foo" />;
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
