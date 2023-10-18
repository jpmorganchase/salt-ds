export const rowDragColumns = [
  {
    headerName: "Name",
    field: "name",
    filter: "agTextColumnFilter",
    rowDrag: true,
  },
  {
    headerName: "Code",
    field: "code",
    filter: "agTextColumnFilter",
    minWidth: 120,
  },
  { headerName: "Capital", field: "capital" },
  {
    headerName: "Population",
    field: "population",
    filter: "agNumberColumnFilter",
    editable: true,
    cellClass: ["editable-cell", "numeric-cell"],
  },
];
