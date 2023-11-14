import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "../index.css";

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
