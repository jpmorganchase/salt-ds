import React, { useEffect, useState } from "react";
import { Button } from "@jpmorganchase/uitk-core";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import customFilterExampleColumns from "../dependencies/customFilterExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import "../../uitk-ag-theme.css";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const CustomFilterExample = function CustomFilterExample(
  props: AgGridReactProps
) {
  const [hasSavedState, setHasSavedState] = useState(true);
  const { api, isGridReady, agGridProps, containerProps } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
    }
  }, [isGridReady]);

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
    (window as any).filterState = api!.getFilterModel();
    setHasSavedState(false);
  };

  const restoreState = () => {
    api!.setFilterModel((window as any).filterState);
    setHasSavedState(true);
  };

  const clearState = () => {
    api!.setFilterModel(null);
    setHasSavedState(true);
  };

  return (
    <div style={{ marginTop: 25 }}>
      <div style={{ display: "flex" }}>
        <Button onClick={handlePopLt100kClick}>Pop &gt; 100k</Button>
        &nbsp;
        <Button onClick={handlePopMt100kClick}>Pop &lt; 100k</Button>
        &nbsp;
        <Button onClick={filterNewYork}>New York</Button>
        &nbsp;
        <Button onClick={saveState}>Save State</Button>
        &nbsp;
        <Button disabled={hasSavedState} onClick={restoreState}>
          Restore State
        </Button>
        &nbsp;
        <Button disabled={hasSavedState} onClick={clearState}>
          Clear Stored Filter
        </Button>
      </div>
      <div
        style={{ height: 800, width: 800, marginTop: 25 }}
        {...containerProps}
      >
        <AgGridReact
          defaultColDef={{ floatingFilter: true, filter: true }}
          {...agGridProps}
          {...props}
        />
      </div>
    </div>
  );
};

CustomFilterExample.defaultProps = {
  columnDefs: customFilterExampleColumns,
  rowData: dataGridExampleData,
};

export default function CustomFilter(props: AgGridReactProps) {
  return <CustomFilterExample {...props} />;
}
