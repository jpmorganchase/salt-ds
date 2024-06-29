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
    suppressHeaderMenuButton: true,
    floatingFilter: true,
  },
  {
    headerName: "Capital",
    field: "capital",
    filter: "agSetColumnFilter",
    suppressHeaderMenuButton: true,
    floatingFilter: true,
  },
  {
    headerName: "Population",
    field: "population",
    filter: "agNumberColumnFilter",
    suppressHeaderMenuButton: true,
    floatingFilter: true,
    cellClass: ["numeric-cell"],
  },
];

export default customFilterExampleColumns;
