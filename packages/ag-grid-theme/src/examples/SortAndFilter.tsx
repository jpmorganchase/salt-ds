import type { GridReadyEvent } from "ag-grid-community";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import rowData from "../dependencies/dataGridExampleData";

const colDef = [
  {
    field: "name",
    filterParams: {
      defaultOption: "Alaska",
    },
  },
  { field: "code", sort: "asc" as const },
  { field: "capital" },
  {
    field: "population",
    type: "numericColumn",
    filter: "agNumberColumnFilter",
    cellClass: ["numeric-cell"],
  },
  {
    field: "rating",
    type: "numericColumn",
    filter: "agNumberColumnFilter",
    cellClass: ["numeric-cell"],
  },
];

const onGridReady = async ({ api }: GridReadyEvent) => {
  // set filter model and update
  await api.setColumnFilterModel("name", {
    values: ["Alabama", "Alaska", "Arizona"],
  });
  await api.setColumnFilterModel("rating", {
    type: "lessThan",
    filter: 50,
  });

  // refresh rows based on the filter (not automatic to allow for batching multiple filters)
  api.onFilterChanged();
};

const SortAndFilter = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: 800 }}>
      <AgGridReact
        columnDefs={colDef}
        rowData={rowData}
        onGridReady={onGridReady}
        {...props}
      />
    </div>
  );
};

export default SortAndFilter;
