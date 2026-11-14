import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "@salt-ds/ag-grid-theme/salt-ag-theme.css";
import "../src/dependencies/setupAgGrid";

import "@salt-ds/countries/saltSharpCountries.css";

export default {
  title: "Ag Grid/Ag Grid Theme",
  component: AgGridReact,
  parameters: {
    // Make all ag grid examples go through chromatic
    chromatic: {
      disableSnapshot: false,
      delay: 200,
      // double the examples' 800px width given we're using side-by-side mode, + panel wrapper padding
      modes: {
        dual: { mode: "side-by-side", viewport: { width: 800 * 2 + 24 * 4 } },
      },
    },
  },
};

export {
  AbsoluteSorting,
  CellValidation,
  CheckboxSelection,
  Coloration,
  ColumnGroup,
  ColumnSpanning,
  ContextMenu,
  CustomFilter,
  Default,
  DragRowOrder,
  FloatingFilter,
  HDCompact,
  HeaderVariants,
  Icons,
  InfiniteScroll,
  LoadingOverlay,
  MasterDetail,
  NoDataOverlay,
  Pagination,
  ParentChildRows,
  PinnedRows,
  ProvidedCellEditors,
  RangeSelection,
  RowGrouping,
  RowGroupPanel,
  RowValidation,
  SortAndFilter,
  StatusBar,
  SuppressMenuHide,
  ToolPanel,
  VariantSecondary,
  VariantZebra,
  WrappedCell,
  WrappedHeader,
} from "../src/examples";
