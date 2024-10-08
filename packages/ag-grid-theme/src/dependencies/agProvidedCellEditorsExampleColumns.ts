import { languages, shortColorData } from "./dataGridExampleDataCellEditors";

const agProvidedCellEditorsExampleColumns = [
  {
    headerName: "Boolean",
    field: "checked",
    cellDataType: "boolean",
    cellRenderer: "agCheckboxCellRenderer",
    cellEditor: "agCheckboxCellEditor",
    editable: true,
  },
  {
    headerName: "Text",
    field: "name",
    cellEditor: "agTextCellEditor",
    editable: true,
    cellClass: ["editable-cell"],
  },
  {
    headerName: "Large Text",
    field: "sentence",
    cellEditor: "agLargeTextCellEditor",
    cellEditorPopup: true,
    editable: true,
    cellClass: ["editable-cell"],
  },
  {
    headerName: "Select",
    field: "lang",
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: languages,
    },
    editable: true,
    cellClass: ["editable-cell"],
  },
  {
    headerName: "Rich Select",
    field: "color",
    cellEditor: "agRichSelectCellEditor",
    cellEditorParams: {
      values: shortColorData,
    },
    editable: true,
    cellClass: ["editable-cell"],
  },
  {
    headerName: "Number",
    field: "count",
    cellEditor: "agNumberCellEditor",
    cellEditorParams: {
      min: 0,
      max: 100,
    },
    // Right aligns header
    type: "numericColumn",
    editable: true,
    cellClass: ["numeric-cell", "editable-cell"],
  },
  {
    headerName: "Date",
    field: "date",
    cellDataType: "dateString",
    cellEditor: "agDateStringCellEditor",
    cellEditorParams: {
      min: "2000-01-01",
      max: "2019-12-31",
    },
    editable: true,
    cellClass: ["editable-cell"],
  },
];

export default agProvidedCellEditorsExampleColumns;
