import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import { defaultData, customFilterColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const CustomFilter = () => {
  const [hasSavedState, setHasSavedState] = useState(true);
  // We've created a local custom hook to set the rows and column sizes. For complete example check the `Default` example.
  const { api, isGridReady, agGridProps, containerProps } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
    }
  }, [api, isGridReady]);

  const handlePopMt100kClick = () => {
    const popMt100kComponent = api!.getFilterInstance("population")!;
    api!.setFilterModel(null);

    popMt100kComponent.setModel({
      type: "greaterThan",
      filter: 100000,
      filterTo: null,
    });

    api!.onFilterChanged();
    setHasSavedState(false);
  };

  const handlePopLt100kClick = () => {
    const popLt100kComponent = api!.getFilterInstance("population")!;
    api!.setFilterModel(null);

    popLt100kComponent.setModel({
      type: "lessThan",
      filter: 100000,
      filterTo: null,
    });

    api!.onFilterChanged();
    setHasSavedState(false);
  };

  const filterNewYork = () => {
    const filterNewYork = api!.getFilterInstance("name")!;
    api!.setFilterModel(null);
    filterNewYork.setModel({
      type: "equals",
      filter: "New York",
      filterTo: null,
    });
    api!.onFilterChanged();
    setHasSavedState(false);
  };

  const saveState = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    (window as any).filterState = api!.getFilterModel();
    setHasSavedState(false);
  };

  const restoreState = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    api!.setFilterModel((window as any).filterState);
    setHasSavedState(true);
  };

  const clearState = () => {
    api!.setFilterModel(null);
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
