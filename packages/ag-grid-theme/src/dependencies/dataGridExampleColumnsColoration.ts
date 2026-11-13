import type { CellClassParams } from "ag-grid-community";

const dataGridExampleColumnsColoration = [
  {
    headerName: "Name",
    field: "name",
    cellStyle: {
      color: "var(--salt-category-1-foreground)",
      backgroundColor: "var(--salt-category-1-background)",
    },
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
    cellStyle: (params: CellClassParams) => {
      if (params.value === "Atlanta") {
        return {
          color: "var(--salt-category-2-foreground)",
          backgroundColor: "var(--salt-category-2-background)",
        };
      }
      return null;
    },
  },
  {
    headerName: "Population",
    field: "population",
    filter: "agNumberColumnFilter",
    type: "numericColumn",
    editable: true,
    cellClass: ["editable-cell", "numeric-cell"],
  },
];

export default dataGridExampleColumnsColoration;
