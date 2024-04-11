import { StackLayout } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useEffect } from "react";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
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
  const { switcher, themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps, isGridReady, api } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  useEffect(() => {
    if (isGridReady) {
      // set filter model and update

      api?.getFilterInstance("name")?.setModel({
        values: ["Alabama", "Alaska", "Arizona"],
      });

      api?.getFilterInstance("rating")?.setModel({
        type: "lessThan",
        filter: 50,
      });

      // refresh rows based on the filter (not automatic to allow for batching multiple filters)
      api?.onFilterChanged();
    }
  }, [api, isGridReady]);

  return (
    <StackLayout gap={4}>
      {switcher}
      <div {...containerProps}>
        <AgGridReact
          columnDefs={colDef}
          rowData={rowData}
          {...agGridProps}
          {...props}
        />
      </div>
    </StackLayout>
  );
};

SortAndFilter.parameters = {
  chromatic: { disableSnapshot: false },
};

export default SortAndFilter;
