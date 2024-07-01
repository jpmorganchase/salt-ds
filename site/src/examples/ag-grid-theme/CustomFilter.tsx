import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { customFilterColumns, defaultData } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const CustomFilter = () => {
  const [hasSavedState, setHasSavedState] = useState(true);
  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
  const { api, agGridProps, containerProps } = useAgGridHelpers();

  const handlePopMt100kClick = async () => {
    await api?.setColumnFilterModel("population", {
      type: "greaterThan",
      filter: 100000,
      filterTo: null,
    });

    api?.onFilterChanged();
    setHasSavedState(false);
  };

  const handlePopLt100kClick = async () => {
    await api?.setColumnFilterModel("population", {
      type: "lessThan",
      filter: 100000,
      filterTo: null,
    });

    api?.onFilterChanged();
    setHasSavedState(false);
  };

  const filterNewYork = async () => {
    await api?.setColumnFilterModel("name", {
      type: "equals",
      filter: "New York",
      filterTo: null,
    });

    api?.onFilterChanged();
    setHasSavedState(false);
  };

  const saveState = () => {
    (window as any).filterState = api?.getFilterModel();
    setHasSavedState(false);
  };

  const restoreState = () => {
    api?.setFilterModel((window as any).filterState);
    setHasSavedState(true);
  };

  const clearState = () => {
    api?.setFilterModel(null);
    setHasSavedState(true);
  };

  return (
    <StackLayout gap={4}>
      <FlowLayout gap={2}>
        <Button onClick={handlePopLt100kClick}>Pop &gt; 100k</Button>
        <Button onClick={handlePopMt100kClick}>Pop &lt; 100k</Button>
        <Button onClick={filterNewYork}>New York</Button>
        <Button onClick={saveState}>Save State</Button>
        <Button disabled={hasSavedState} onClick={restoreState}>
          Restore State
        </Button>
        <Button disabled={hasSavedState} onClick={clearState}>
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
