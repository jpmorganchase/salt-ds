import { ColDef } from "ag-grid-community";

const dataGridExampleColumns: ColDef[] = [
  {
    headerName: "",
    field: "on",
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 38,
    pinned: "left",
    suppressMenu: true,
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
  },
  {
    headerName: "Population",
    type: "numericColumn",
    field: "population",
    filter: "agNumberColumnFilter",
    editable: true,
    cellClass: ["numeric-cell", "editable-cell"],
  },
];
export default dataGridExampleColumns;
