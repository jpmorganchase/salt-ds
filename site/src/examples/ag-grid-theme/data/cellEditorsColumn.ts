import type { IDateFilterParams } from "ag-grid-community";
import { languages, shortColorData } from "./cellEditorsData";

const dateFilterParams: IDateFilterParams = {
  comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
    const dateAsString = cellValue;
    if (dateAsString == null) return -1;
    const dateParts = dateAsString.split("-");
    const cellDate = new Date(
      Number(dateParts[0]),
      Number(dateParts[1]) - 1,
      Number(dateParts[2]),
    );
    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0;
    }
    if (cellDate < filterLocalDateAtMidnight) {
      return -1;
    }
    if (cellDate > filterLocalDateAtMidnight) {
      return 1;
    }
    return 0;
  },
  minValidYear: 2000,
  maxValidYear: 2040,
  inRangeFloatingFilterDateFormat: "YYYY-MM-Do",
};

export const cellEditorsColumn = [
  {
    headerName: "Text",
    field: "name",
    cellEditor: "agTextCellEditor",
    editable: true,
    filter: "agTextColumnFilter",
    cellClass: ["editable-cell"],
  },
  {
    headerName: "Large Text",
    field: "sentence",
    cellEditor: "agLargeTextCellEditor",
    cellEditorPopup: true,
    editable: true,
    filter: "agTextColumnFilter",
    cellClass: ["editable-cell"],
  },
  {
    headerName: "Boolean",
    field: "checked",
    cellDataType: "boolean",
    cellRenderer: "agCheckboxCellRenderer",
    cellEditor: "agCheckboxCellEditor",
    editable: true,
    filter: true,
  },
  {
    headerName: "Select",
    field: "lang",
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: languages,
      valueListGap: 0,
    },
    editable: true,
    filter: true,
    cellClass: ["editable-cell"],
  },
  {
    headerName: "Rich Select",
    field: "color",
    cellEditor: "agRichSelectCellEditor",
    cellEditorParams: {
      values: shortColorData,
      valueListGap: 0,
      allowTyping: true,
      filterList: true,
      highlightMatch: true,
    },
    editable: true,
    filter: true,
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
    filter: "agNumberColumnFilter",
    cellClass: ["numeric-cell", "editable-cell"],
  },
  {
    headerName: "Date",
    field: "date",
    cellDataType: "dateString",
    cellEditor: "agDateStringCellEditor",
    cellEditorParams: {
      min: "2000-01-01",
      max: "2039-12-31",
    },
    editable: true,
    filter: "agDateColumnFilter",
    filterParams: dateFilterParams,
    cellClass: ["editable-cell"],
  },
];
