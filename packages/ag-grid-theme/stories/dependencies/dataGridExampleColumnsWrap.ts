import { ColDef } from "ag-grid-community";

const dataGridExampleColumnsWrap: ColDef[] = [
  {
    headerName: "",
    field: "on",
    width: 38,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    pinned: "left",
    suppressMenu: true,
  },
  {
    headerName: "Name of State",
    field: "name",
    width: 90,
    filterParams: {
      buttons: ["reset", "apply"],
    },
    editable: false,
    suppressMenu: true,
  },
  {
    headerName: "State code",
    field: "code",
    width: 80,
  },
  {
    headerName: "State capital",
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
    width: 100,
  },
  {
    headerName: "Date",
    type: "dateColumn",
    field: "date",
    filter: "agDateColumnFilter",
    width: 80,
  },
];
export default dataGridExampleColumnsWrap;
