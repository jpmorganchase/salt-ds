import type { ColDef, ColSpanParams } from "ag-grid-community";

export const spannedColumns: ColDef[] = [
  {
    headerName: "Name",
    field: "name",
    pinned: "left",
  },
  {
    headerName: "Code",
    field: "code",
    pinned: "left",
    colSpan: (param: ColSpanParams) => {
      const code = param.data.code;
      if (code === "AL") {
        return 2;
      }
      if (code === "CA") {
        return 3;
      }
      return 1;
    },
  },
  {
    headerName: "Capital",
    field: "capital",
  },
  {
    headerName: "Population",
    field: "population",
    pinned: "left",
    cellClass: ["numeric-cell"],
  },
];
