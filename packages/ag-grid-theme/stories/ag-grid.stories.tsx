/**
 * This file replaces the previous index.story.js file
 * which used Storybook v4 'storiesOf' API.
 */
import { AgGridReact } from "ag-grid-react";

export default {
  title: "Ag Grid Theme",
  component: AgGridReact,
  // decorators: [withFixedWidthWrapper, withRowStripsKnob]
};

export {
  Default as BasicGrid,
  AddRemoveRows,
  AggregateValues,
  CellDropdownEditor,
  ChangeDetection,
  CheckboxSelection,
  Coloration,
  ColumnGroup,
  ColumnSpanning,
  ContextMenu,
  CustomFilter,
  // CustomPagination, TODO
  DragRowOrder,
  ExcelExport,
  FloatingFilter,
  InfiniteScroll,
  LoadingOverlay,
  MasterDetail,
  NoDataOverlay,
  Pagination,
  ParentChildRows,
  RowGrouping,
  RowGroupingWithPagination,
  RowGroupPanel,
  SetFilter,
  SingleClickEdit,
  StatusBar,
} from "./examples";
