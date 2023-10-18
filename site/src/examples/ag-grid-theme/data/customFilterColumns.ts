import { ColDef } from "ag-grid-community";

export const customFilterColumns: ColDef[] = [
  {
    headerName: "Name",
    field: "name",
    filter: "agTextColumnFilter",
    suppressMenu: true,
    pinned: "right",
    floatingFilter: true,
    width: 100,
    resizable: false,
  },
  {
    headerName: "Code",
    field: "code",
    filter: "agTextColumnFilter",
    minWidth: 120,
    suppressMenu: true,
    floatingFilter: true,
  },
  {
    headerName: "Capital",
    field: "capital",
    filter: "agSetColumnFilter",
    suppressMenu: true,
    floatingFilter: true,
  },
  {
    headerName: "Population",
    field: "population",
    filter: "agNumberColumnFilter",
    suppressMenu: true,
    floatingFilter: true,
    cellClass: ["numeric-cell"],
  },
];
