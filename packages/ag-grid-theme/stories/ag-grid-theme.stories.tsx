import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import "../salt-ag-theme.css";
import "../uitk-ag-theme.css";

export default {
  title: "Data Grid/Ag Grid Theme",
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
  HDCompactUITK,
  HDCompactDark,
  HDCompactDarkUitk,
  InfiniteScroll,
  LoadingOverlay,
  MasterDetail,
  MasterDetailUITK,
  MasterDetailDark,
  MasterDetailDarkUITK,
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
  WrappedHeader,
} from "../src/examples";
