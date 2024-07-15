import type { ColDef } from "ag-grid-community";
import { FlagRenderer } from "./cell-renderers/FlagRenderer";
import { DropdownEditor } from "./cell-editors/DropdownEditor";

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
    cellClass: ["editable-cell"],
  },
  {
    headerName: "Date",
    field: "date",
    filter: "agDateColumnFilter",
  },
  {
    headerName: "Rating",
    field: "rating",
    editable: true,
    cellEditor: DropdownEditor,
    cellEditorParams: {
      source: [10, 20, 30, 40, 50, 60],
    },
    cellClass: ["editable-cell"],
  },
  {
    headerName: "Flag",
    field: "country",
    cellRenderer: FlagRenderer,
    initialWidth: 80,
  },
];
export default dataGridExampleColumnsHdCompact;
