import React, { useEffect, useState } from "react";
import { Button } from "@salt-ds/core";
import { Switch } from "@salt-ds/lab";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import customFilterExampleColumns from "../dependencies/customFilterExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import "../../uitk-ag-theme.css";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const CustomFilter = (props: AgGridReactProps) => {
  const [isSaltTheme, setSaltTheme] = useState(false);

  const onThemeChange = () => {
    setSaltTheme(!isSaltTheme);
  };

  const [hasSavedState, setHasSavedState] = useState(true);
  const { api, isGridReady, agGridProps, containerProps } = useAgGridHelpers(
    isSaltTheme ? "ag-theme-salt" : undefined
  );

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
    <div>
      <div>
        <Switch
          checked={isSaltTheme}
          onChange={onThemeChange}
          label="Salt AG Grid theme"
        />
      </div>
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
            columnDefs={customFilterExampleColumns}
            rowData={dataGridExampleData}
            {...agGridProps}
            {...props}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomFilter;
