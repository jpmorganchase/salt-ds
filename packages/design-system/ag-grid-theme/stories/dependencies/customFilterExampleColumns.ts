import { ColDef } from "ag-grid-community";

const customFilterExampleColumns: ColDef[] = [
  {
    headerName: "Name",
    field: "name",
    filter: "agTextColumnFilter",
    suppressMenu: true,
    floatingFilter: true,
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
    filter: "agTextColumnFilter",
    suppressMenu: true,
    floatingFilter: true,
  },
  {
    headerName: "Population",
    field: "population",
    filter: "agNumberColumnFilter",
    suppressMenu: true,
    floatingFilter: true,
  },
];

export default customFilterExampleColumns;
