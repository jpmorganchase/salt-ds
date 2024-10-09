import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { useState } from "react";
import customFilterExampleColumns from "../dependencies/customFilterExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

let savedFilterModel: any = null;

const CustomFilter = (props: AgGridReactProps) => {
  const [hasSavedState, setHasSavedState] = useState(true);
  const { api, agGridProps, containerProps } = useAgGridHelpers();

  const handlePopMt100kClick = async () => {
    await api?.setColumnFilterModel("population", {
      filterModels: [
        {
          type: "greaterThan",
          filter: 100000,
          filterTo: null,
        },
      ],
    });

    api?.onFilterChanged();
    setHasSavedState(false);
  };

  const handlePopLt100kClick = async () => {
    await api?.setColumnFilterModel("population", {
      filterModels: [
        {
          type: "lessThan",
          filter: 100000,
          filterTo: null,
        },
      ],
    });

    api?.onFilterChanged();
    setHasSavedState(false);
  };

  const filterNewYork = async () => {
    await api?.setColumnFilterModel("name", {
      filterModels: [
        {
          type: "equals",
          filter: "New York",
          filterTo: null,
        },
      ],
    });
    api?.onFilterChanged();
    setHasSavedState(false);
  };

  const saveState = () => {
    savedFilterModel = api?.getFilterModel();
    setHasSavedState(false);
  };

  const restoreState = () => {
    api?.setFilterModel(savedFilterModel);
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
