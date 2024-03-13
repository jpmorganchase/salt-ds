import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import "../uitk-ag-theme.css";
import "../salt-ag-theme.css";

export default {
  title: "Ag Grid/Ag Grid Theme",
  component: AgGridReact,
  // decorators: [withFixedWidthWrapper, withRowStripsKnob]
};

export {
  Default as BasicGrid,
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
  StatusBar,
  StatusBarDark,
  VariantSecondary,
  VariantSecondaryDark,
  VariantZebra,
  VariantZebraDark,
  WrappedCell,
  WrappedHeader,
} from "./examples";
