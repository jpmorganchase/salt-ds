import type { ColDef } from "ag-grid-community";

export const masterDetailColumns: ColDef[] = [
  {
    field: "name",
    cellRenderer: "agGroupCellRenderer",
  },
  { field: "code" },
  { field: "capital" },
  { field: "population", cellClass: ["numeric-cell"] },
  { field: "rating", cellClass: ["numeric-cell"] },
];
