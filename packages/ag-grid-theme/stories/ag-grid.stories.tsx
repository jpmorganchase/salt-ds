import { AgGridReact } from "ag-grid-react";
import { userEvent, within, expect } from "@storybook/test";
import type { Meta, StoryObj } from "@storybook/react";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import "../uitk-ag-theme.css";
import "../salt-ag-theme.css";

import { Default } from "./examples";

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
  MasterDetailDark,
  NoDataOverlay,
  Pagination,
  ParentChildRows,
  RowGrouping,
  RowGroupPanel,
  PinnedRows,
  SortAndFilter,
  StatusBar,
  StatusBarDark,
  VariantSecondary,
  VariantZebra,
  WrappedCell,
  WrappedHeader,
} from "./examples";
