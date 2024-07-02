import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { useState } from "react";
import customFilterExampleColumns from "../dependencies/customFilterExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const CustomFilter = (props: AgGridReactProps) => {
  const [hasSavedState, setHasSavedState] = useState(true);
  const { api, agGridProps, containerProps } = useAgGridHelpers();

  const handlePopMt100kClick = () => {
    const popMt100kComponent = api?.getFilterInstance("population");
    api?.setFilterModel(null);

    popMt100kComponent?.setModel({
      type: "greaterThan",
      filter: 100000,
      filterTo: null,
    });

    api?.onFilterChanged();
    setHasSavedState(false);
  };

  const handlePopLt100kClick = () => {
    const popLt100kComponent = api?.getFilterInstance("population");
    api?.setFilterModel(null);

    popLt100kComponent?.setModel({
      type: "lessThan",
      filter: 100000,
      filterTo: null,
    });

    api?.onFilterChanged();
    setHasSavedState(false);
  };

  const filterNewYork = () => {
    const filterNewYork = api?.getFilterInstance("name");
    api?.setFilterModel(null);
    filterNewYork?.setModel({
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
          {...agGridProps}
          {...props}
          defaultColDef={{ floatingFilter: true, filter: true }}
          columnDefs={customFilterExampleColumns}
          rowData={dataGridExampleData}
        />
      </div>
    </StackLayout>
  );
};

export default CustomFilter;
