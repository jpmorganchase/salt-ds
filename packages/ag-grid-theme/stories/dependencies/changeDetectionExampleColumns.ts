const changeDetectionExampleColumns = [
  {
    field: "topGroup",
    rowGroup: true,
    hide: true,
  },
  {
    field: "group",
    rowGroup: true,
    hide: true,
  },
  {
    headerName: "ID",
    field: "id",
    cellClass: "number-cell",
    sortable: true,
  },
  {
    headerName: "A",
    field: "a",
    type: "valueColumn",
    sortable: true,
  },
  {
    headerName: "B",
    field: "b",
    type: "valueColumn",
    sortable: true,
  },
  {
    headerName: "C",
    field: "c",
    type: "valueColumn",
    sortable: true,
  },
  {
    headerName: "D",
    field: "d",
    type: "valueColumn",
    sortable: true,
  },
  {
    headerName: "E",
    field: "e",
    type: "valueColumn",
    sortable: true,
  },
  {
    headerName: "F",
    field: "f",
    type: "valueColumn",
    sortable: true,
  },
  {
    headerName: "Total",
    sortable: true,
    valueGetter:
      'getValue("a") + getValue("b") + getValue("c") + getValue("d") + getValue("e") + getValue("f")',
  },
];

export default changeDetectionExampleColumns;
