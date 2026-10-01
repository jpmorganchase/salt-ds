import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import type { FilterModel } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { customFilterColumns, defaultData } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const CustomFilter = () => {
  const [savedFilterModel, setSavedFilterModel] = useState<FilterModel | null>(
    null,
  );
  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers();

  const handlePopGt100kClick = async () => {
    await api?.setColumnFilterModel("population", {
      type: "greaterThan",
      filter: 100000,
      filterTo: null,
    });

    api?.onFilterChanged();
  };

  const handlePopLt100kClick = async () => {
    await api?.setColumnFilterModel("population", {
      type: "lessThan",
      filter: 100000,
      filterTo: null,
    });

    api?.onFilterChanged();
  };

  const filterNewYork = async () => {
    await api?.setColumnFilterModel("name", {
      type: "equals",
      filter: "New York",
      filterTo: null,
    });

    api?.onFilterChanged();
  };

  const saveFilters = () => {
    if (api) {
      setSavedFilterModel(structuredClone(api.getFilterModel()));
    }
  };

  const restoreFilters = () => {
    if (savedFilterModel !== null) {
      api?.setFilterModel(structuredClone(savedFilterModel));
    }
  };

  const clearStoredFilter = () => {
    setSavedFilterModel(null);
  };

  return (
    <StackLayout gap={4}>
      <FlowLayout gap={2}>
        <Button disabled={!isGridReady} onClick={handlePopGt100kClick}>
          Pop &gt; 100k
        </Button>
        <Button disabled={!isGridReady} onClick={handlePopLt100kClick}>
          Pop &lt; 100k
        </Button>
        <Button disabled={!isGridReady} onClick={filterNewYork}>
          New York
        </Button>
        <Button disabled={!isGridReady} onClick={saveFilters}>
          Save Filters
        </Button>
        <Button
          disabled={!isGridReady || savedFilterModel === null}
          onClick={restoreFilters}
        >
          Restore Saved Filters
        </Button>
        <Button
          disabled={savedFilterModel === null}
          onClick={clearStoredFilter}
        >
          Clear Stored Filter
        </Button>
      </FlowLayout>

      <div {...containerProps}>
        <AgGridReact
          defaultColDef={{ floatingFilter: true, filter: true }}
          columnDefs={customFilterColumns}
          rowData={defaultData}
          {...agGridProps}
        />
      </div>
    </StackLayout>
  );
};
