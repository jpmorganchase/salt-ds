const dataGridExampleRowGrouping = [
  {
    headerName: "Name",
    field: "name",
    filter: "agTextColumnFilter",
    rowGroup: true,
    hide: true,
  },
  {
    headerName: "Code",
    field: "code",
    filter: "agTextColumnFilter",
    minWidth: 120,
  },
  {
    headerName: "Capital",
    field: "capital",
    filter: "agTextColumnFilter",
    rowGroup: true,
  },
  {
    headerName: "Population",
    field: "population",
    filter: "agNumberColumnFilter",
    cellClass: ["numeric-cell"],
  },
];

export default dataGridExampleRowGrouping;
