import type { ColDef, RowClassParams } from "ag-grid-community";
import { StatusRenderer } from "./cell-renderers/StatusRenderer";

export const validationRowClassRules = {
  "salt-grid-row-error": (params: RowClassParams) =>
    params.data.status === "error",
  "salt-grid-row-warning": (params: RowClassParams) =>
    params.data.status === "warning",
  "salt-grid-row-success": (params: RowClassParams) =>
    params.data.status === "success",
};

export const validationCellClassRules = {
  "salt-grid-cell-error": (params: RowClassParams) =>
    params.data.status === "error",
  "salt-grid-cell-warning": (params: RowClassParams) =>
    params.data.status === "warning",
  "salt-grid-cell-success": (params: RowClassParams) =>
    params.data.status === "success",
};

export const validationRowExampleColumns: ColDef[] = [
  {
    headerName: "Status",
    field: "status",
    flex: 1,
    pinned: "left",
    cellRenderer: StatusRenderer,
  },
  {
    headerName: "Value",
    field: "value",
    editable: true,
    cellClass: "editable-cell",
  },
  {
    headerName: "Color",
    field: "color",
    editable: false,
  },
  {
    headerName: "Currency",
    field: "currency",
    editable: false,
  },
];

export const validationCellExampleColumns: ColDef[] = [
  {
    headerName: "Status",
    field: "status",
    editable: true,
    cellClass: "editable-cell",
    cellClassRules: validationCellClassRules,
    cellEditor: "agRichSelectCellEditor",
    cellEditorParams: {
      values: ["default", "error", "warning", "success"],
      valueListGap: 0,
      allowTyping: true,
      filterList: true,
      highlightMatch: true,
    },
  },
  {
    headerName: "Value",
    field: "value",
    editable: true,
    cellClassRules: validationCellClassRules,
    cellEditor: "agTextCellEditor",
    cellClass: ["numeric-cell", "editable-cell"],
    // Right aligns header
    type: "numericColumn",
  },
  {
    headerName: "Color",
    field: "color",
    editable: false,
  },
  {
    headerName: "Currency",
    field: "currency",
    editable: false,
  },
];
