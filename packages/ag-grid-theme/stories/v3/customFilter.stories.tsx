import "./_setupV3";
/**
 * Phase 2 V3 spike — `CustomFilter` story rendered against `saltTheme`.
 *
 * Exercises `saltInputStyle` (Phase 2 wiring lands in the same commit as
 * this story) plus the underlying `inputStyleUnderlined` AG built-in that
 * saltTheme composes in:
 *   - every column has `floatingFilter: true` so the Salt-styled filter
 *     input shows under each header (visible on initial render — no need
 *     to open a menu).
 *   - clicking the Pop/New York/Save State buttons drives the AG filter
 *     model programmatically.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → CustomFilter`
 * (`packages/ag-grid-theme/src/examples/CustomFilter.tsx`). Uses AG v3-
 * native `onGridReady` to grab the api ref (legacy used `useAgGridHelpers`).
 */
import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import {
  AllCommunityModule,
  type FilterModel,
  type GridApi,
  type GridReadyEvent,
  ModuleRegistry,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { useRef, useState } from "react";
import customFilterExampleColumns from "../../src/dependencies/customFilterExampleColumns";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

let savedFilterModel: FilterModel | null = null;

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const CustomFilter = () => {
  const apiRef = useRef<GridApi | null>(null);
  const [hasSavedState, setHasSavedState] = useState(true);

  const onGridReady = (params: GridReadyEvent) => {
    apiRef.current = params.api;
  };

  const handlePopMt100kClick = async () => {
    await apiRef.current?.setColumnFilterModel("population", {
      type: "greaterThan",
      filter: 100000,
      filterTo: null,
    });
    apiRef.current?.onFilterChanged();
    setHasSavedState(false);
  };

  const handlePopLt100kClick = async () => {
    await apiRef.current?.setColumnFilterModel("population", {
      type: "lessThan",
      filter: 100000,
      filterTo: null,
    });
    apiRef.current?.onFilterChanged();
    setHasSavedState(false);
  };

  const filterNewYork = async () => {
    await apiRef.current?.setColumnFilterModel("name", {
      type: "equals",
      filter: "New York",
      filterTo: null,
    });
    apiRef.current?.onFilterChanged();
    setHasSavedState(false);
  };

  const saveState = () => {
    savedFilterModel = apiRef.current?.getFilterModel() || null;
    setHasSavedState(false);
  };

  const restoreState = () => {
    apiRef.current?.setFilterModel(savedFilterModel);
    setHasSavedState(true);
  };

  const clearState = () => {
    apiRef.current?.setFilterModel(null);
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

      <div style={{ height: 400, width: 800 }}>
        <AgGridReact
          theme={saltTheme}
          {...saltAgGridDefaults}
          defaultColDef={{
            ...saltAgGridDefaults.defaultColDef,
            floatingFilter: true,
            filter: true,
          }}
          columnDefs={customFilterExampleColumns}
          rowData={dataGridExampleData}
          onGridReady={onGridReady}
        />
      </div>
    </StackLayout>
  );
};

