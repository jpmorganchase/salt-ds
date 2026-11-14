import type { ColDef } from "ag-grid-community";

export const masterDetailExampleData: ColDef[] = [
  {
    field: "name",
    cellRenderer: "agGroupCellRenderer",
  },
  { field: "code" },
  { field: "capital" },
  { field: "population", cellClass: ["numeric-cell"] },
  { field: "rating", cellClass: ["numeric-cell"] },
];
export default masterDetailExampleData;
