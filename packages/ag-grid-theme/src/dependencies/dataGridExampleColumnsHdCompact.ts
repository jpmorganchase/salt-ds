import type { ColDef } from "ag-grid-community";
import { FlagRenderer } from "./cell-renderers/FlagRenderer";

const dataGridExampleColumnsHdCompact: ColDef[] = [
  {
    headerName: "",
    field: "on",
    width: 70,
    flex: 1,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    pinned: "left",
    suppressHeaderMenuButton: true,
    suppressHeaderFilterButton: true,
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
    headerName: "Date",
    field: "date",
    filter: "agDateColumnFilter",
  },
  {
    headerName: "Rating",
    field: "rating",
    // Not using `editable-cell` as it doesn't work with Dropdown focus style
    editable: true,
    cellEditor: "DropdownEditor",
    cellEditorParams: {
      source: [10, 20, 30, 40, 50, 60],
    },
  },
  {
    headerName: "Flag",
    field: "country",
    cellRenderer: FlagRenderer,
    initialWidth: 80,
    suppressHeaderMenuButton: true,
    suppressHeaderFilterButton: true,
  },
];
export default dataGridExampleColumnsHdCompact;
