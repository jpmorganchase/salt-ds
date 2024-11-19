import type { ColDef } from "ag-grid-community";

const customFilterExampleColumns: ColDef[] = [
  {
    headerName: "Name",
    field: "name",
    filter: "agTextColumnFilter",
    suppressHeaderMenuButton: true,
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
    floatingFilter: true,
  },
  {
    headerName: "Capital",
    field: "capital",
    filter: "agSetColumnFilter",
    floatingFilter: true,
  },
  {
    headerName: "Population",
    type: "numericColumn",
    field: "population",
    filter: "agNumberColumnFilter",
    floatingFilter: true,
    cellClass: ["numeric-cell"],
  },
];

export default customFilterExampleColumns;
