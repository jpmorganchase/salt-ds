export const infiniteScrollColumns = [
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
      resizable: true,
      valueGetter: "node.id",
      cellRenderer: "loadingRenderer",
      filterParams: {
        clearButton: true,
        applyButton: true,
      },
    },
    {
      headerName: "Code",
      field: "code",
      minWidth: 120,
      sortable: true,
      filter: true,
      resizable: true,
    },
    {
      headerName: "Capital",
      field: "capital",
      sortable: true,
      filter: true,
      resizable: true,
    },
    {
      headerName: "Population",
      field: "population",
      filter: "agNumberColumnFilter",
      sortable: true,
      resizable: true,
      editable: true,
      cellClass: ["editable-cell", "numeric-cell"],
    },
  ];