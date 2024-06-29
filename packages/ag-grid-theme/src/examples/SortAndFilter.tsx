import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { useEffect } from "react";
import rowData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

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

const SortAndFilter = (props: AgGridReactProps) => {
  const { agGridProps, containerProps, isGridReady, api } = useAgGridHelpers();

  useEffect(() => {
    async function setFilter() {
      if (isGridReady) {
        // set filter model and update

        await api?.setColumnFilterModel("name", {
          values: ["Alabama", "Alaska", "Arizona"],
        });
        await api?.setColumnFilterModel("rating", {
          type: "lessThan",
          filter: 50,
        });

        // refresh rows based on the filter (not automatic to allow for batching multiple filters)
        api?.onFilterChanged();
      }
    }

    void setFilter();
  }, [isGridReady]);

  return (
    <div {...containerProps}>
      <AgGridReact
        columnDefs={colDef}
        rowData={rowData}
        {...agGridProps}
        {...props}
      />
    </div>
  );
};

export default SortAndFilter;
