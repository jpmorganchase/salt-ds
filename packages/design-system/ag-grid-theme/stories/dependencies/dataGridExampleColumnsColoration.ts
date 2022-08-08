import { CellClassParams } from "ag-grid-community";

const dataGridExampleColumnsColoration = [
  {
    headerName: "Name",
    field: "name",
    cellStyle: {
      color: "var(--uitk-color-grey-900)",
      backgroundColor: "var(--uitk-color-teal-100)",
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
          color: "var(--uitk-color-grey-900)",
          backgroundColor: "var(--uitk-color-orange-100)",
        };
      } else {
        return null;
      }
    },
  },
  {
    headerName: "Population",
    field: "population",
    filter: "agNumberColumnFilter",
    editable: true,
    cellClass: ["editable-cell"],
  },
];

export default dataGridExampleColumnsColoration;
