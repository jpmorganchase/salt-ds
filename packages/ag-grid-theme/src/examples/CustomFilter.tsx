import { useEffect, useState } from "react";
import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import customFilterExampleColumns from "../dependencies/customFilterExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const CustomFilter = (props: AgGridReactProps) => {
  const { switcher, themeName } = useAgGridThemeSwitcher();

  const [hasSavedState, setHasSavedState] = useState(true);
  const { api, isGridReady, agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (window as any).filterState = api!.getFilterModel();
    setHasSavedState(false);
  };

  const restoreState = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    api!.setFilterModel((window as any).filterState);
    setHasSavedState(true);
  };

  const clearState = () => {
    api!.setFilterModel(null);
    setHasSavedState(true);
  };

  return (
    <StackLayout gap={4}>
      {switcher}
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
          columnDefs={customFilterExampleColumns}
          rowData={dataGridExampleData}
          {...agGridProps}
          {...props}
        />
      </div>
    </StackLayout>
  );
};

CustomFilter.parameters = {
  chromatic: { disableSnapshot: false, delay: 10000 },
};

export default CustomFilter;
