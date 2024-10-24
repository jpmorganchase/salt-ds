import type { ColDef } from "ag-grid-community";

export const defaultColumns: ColDef[] = [
  {
    headerName: "",
    field: "on",
    width: 70,
    flex: 1,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    pinned: "left",
    suppressHeaderMenuButton: true,
    suppressHeaderFilterButton: true,
    resizable: false,
    suppressColumnsToolPanel: true,
    filter: false,
    sortable: false,
  },
  {
    headerName: "Name",
    field: "name",
    filterParams: {
      buttons: ["reset", "apply"],
    },
    editable: false,
  },
  {
    headerName: "Code",
    field: "code",
  },
  {
    headerName: "Capital",
    field: "capital",
    filter: "agSetColumnFilter",
  },
  {
    headerName: "Population",
    type: "numericColumn",
    field: "population",
    filter: "agNumberColumnFilter",
    editable: true,
    cellClass: ["numeric-cell", "editable-cell"],
  },
  {
    headerName: "Date",
    field: "date",
    filter: "agDateColumnFilter",
    editable: true,
    cellClass: ["editable-cell"],
  },
];
