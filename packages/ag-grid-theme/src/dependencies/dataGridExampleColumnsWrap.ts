import type { ColDef } from "ag-grid-community";

const dataGridExampleColumnsWrap: ColDef[] = [
  {
    headerName: "",
    field: "on",
    width: 38,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    pinned: "right",
    suppressHeaderMenuButton: true,
    suppressHeaderFilterButton: true,
  },
  {
    headerName: "Name of State",
    field: "name",
    width: 90,
    filterParams: {
      buttons: ["reset", "apply"],
    },
    editable: false,
    pinned: "left",
    suppressHeaderMenuButton: true,
  },
  {
    headerName: "State code",
    field: "code",
    width: 150,
  },
  {
    headerName: "Capital of state",
    field: "capital",
    width: 80,
  },
  {
    headerName: "Population at time of data gathering",
    type: "numericColumn",
    field: "population",
    filter: "agNumberColumnFilter",
    editable: true,
    cellClass: ["numeric-cell", "editable-cell"],
    width: 200,
  },
  {
    headerName: "Date",
    field: "date",
    filter: "agDateColumnFilter",
    width: 160,
  },
];
export default dataGridExampleColumnsWrap;
