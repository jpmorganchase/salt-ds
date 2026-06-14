import "./_setupV3";
/**
 * Phase 2 V3 spike — `InfiniteScroll` story rendered against `saltTheme`.
 *
 * Exercises AG's `rowModelType="infinite"` against Salt styling — the key
 * visual check is that the placeholder loading cells render with Salt
 * spinner glyphs via the `loadingRenderer` custom component, and the
 * incremental row batches inherit the same Salt row-border / hover tokens.
 *
 * Differences from the legacy story:
 *   - `useAgGridHelpers` is gone — grab the api with `useRef<AgGridReact>`
 *     and an `onGridReady` callback (proposal §9 decision 3: grid-instance
 *     management is generic AG Grid plumbing, stays in consumer code).
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → InfiniteScroll`
 * (`packages/ag-grid-theme/src/examples/InfiniteScroll.tsx`).
 */
import { Spinner } from "@salt-ds/core";
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import {
  AllCommunityModule,
  type GridReadyEvent,
  ModuleRegistry,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";
import dataGridInfiniteScrollExampleColumns from "../../src/dependencies/dataGridInfiniteScrollExampleColumns";
import { V3_STORY_CONTAINER, fitColumnsOnReady } from "./_storyDefaults";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const generateData = <T extends { name: string }>(lst: T[]) =>
  lst.reduce((result, row) => {
    const data: T[] = [row];
    for (let i = 0; i < 20; i++) {
      data.push({ ...row, name: `${row.name} ${i}` });
    }
    return result.concat(data);
  }, [] as T[]);

const dataSourceRows = generateData(dataGridExampleData);

const infiniteScrollComponents = {
  loadingRenderer(params: { value: unknown }) {
    if (params.value !== undefined) {
      return params.value;
    }
    return <Spinner size="default" />;
  },
};

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const InfiniteScroll = () => {
  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
    params.api.setGridOption("datasource", {
      getRows: ({ startRow, endRow, successCallback }) => {
        setTimeout(() => {
          successCallback(
            dataSourceRows.slice(startRow, endRow),
            dataSourceRows.length,
          );
        }, 500);
      },
    });
  };

  return (
    <div style={V3_STORY_CONTAINER}>
      <AgGridReact
        theme={saltTheme}
        {...saltAgGridDefaults}
        columnDefs={dataGridInfiniteScrollExampleColumns}
        rowModelType="infinite"
        infiniteInitialRowCount={100}
        components={infiniteScrollComponents}
        onGridReady={onGridReady}
      />
    </div>
  );
};
