import type { ColDef } from "ag-grid-community";

const dataGridExampleColumns: ColDef[] = [
  {
    headerName: "",
    field: "on",
    width: 70,
    flex: 1,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    pinned: "left",
    suppressHeaderMenuButton: true,
    resizable: false,
    suppressColumnsToolPanel: true,
  },
  {
    headerName: "Name",
    field: "name",
    filterParams: {
      buttons: ["reset", "apply"],
    },
    editable: false,
  },
  {
    headerName: "Code",
    field: "code",
  },
  {
    headerName: "Capital",
    field: "capital",
    filter: "agSetColumnFilter",
  },
  {
    headerName: "Population",
    type: "numericColumn",
    field: "population",
    filter: "agNumberColumnFilter",
    editable: true,
    cellClass: ["numeric-cell", "editable-cell"],
  },
  {
    headerName: "Population (editable numeric)",
    type: "numericColumn",
    field: "population",
    filter: "agNumberColumnFilter",
    editable: true,
    // This is only here for backwards compatibility. Use the combination of the above two classes instead.
    cellClass: ["editable-numeric-cell"],
  },
  {
    headerName: "Date",
    field: "date",
    filter: "agDateColumnFilter",
    editable: true,
    cellClass: ["editable-cell"],
  },
];
export default dataGridExampleColumns;
