import { ColDef, ColSpanParams } from "ag-grid-community";

const columnSpanningExampleColumns: ColDef[] = [
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
      } else if (code === "CA") {
        return 3;
      } else {
        return 1;
      }
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

export default columnSpanningExampleColumns;
