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
};

export const BasicGrid: StoryObj<typeof AgGridReact> = () => {
  return <Default />;
};
BasicGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
BasicGrid.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const azCell = await canvas.findByText("AZ");

  await userEvent.click(azCell);

  // classname has focus ring, which we want to snapshot, #3290
  await expect(azCell).toHaveClass("ag-cell-range-single-cell");
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
  HDCompactDark,
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
  VariantSecondaryDark,
  VariantZebra,
  VariantZebraDark,
  WrappedCell,
  WrappedHeader,
} from "./examples";
