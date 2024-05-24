import { AgGridReact } from "ag-grid-react";

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

export {
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
  Icons,
  InfiniteScroll,
  LoadingOverlay,
  MasterDetail,
  NoDataOverlay,
  Pagination,
  ParentChildRows,
  PinnedRows,
  RangeSelection,
  RowGroupPanel,
  RowGrouping,
  SortAndFilter,
  StatusBar,
  ToolPanel,
  VariantSecondary,
  VariantZebra,
  WrappedCell,
  WrappedHeader,
} from "../src/examples";
