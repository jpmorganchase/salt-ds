import "./_setupV3";
/**
 * Phase 2 V3 spike — `PinnedRows` story rendered against `saltTheme`.
 *
 * Exercises `pinnedTopRowData` + `pinnedBottomRowData` with a sum
 * aggregation on `population`:
 *   - pinned-row dividers come from `saltRangeSelectionAdjustments`'s
 *     `.ag-row-pinned` rules (port of `ag-body.css` lines 34-46)
 *   - the body rows still pick up the regular `rowBorder` from saltTheme
 *   - selection works on the body rows; pinned rows are non-selectable.
 *
 * Differences from the legacy story:
 *   - `useAgGridHelpers` is gone — the component just spreads
 *     `saltAgGridDefaults` directly. The legacy `PinnedRowsExampleProps`
 *     args API is preserved so the story still accepts `aggregate`,
 *     `aggregateColumn`, `showHeader`, `showFooter` from Storybook controls.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → PinnedRows`
 * (`packages/ag-grid-theme/src/examples/PinnedRows.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleColumns from "../../src/dependencies/dataGridExampleColumns";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";
import { V3_STORY_CONTAINER, fitColumnsOnReady } from "./_storyDefaults";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const sumReducer = (acc: number, n: number) => acc + n;
const minReducer = (acc: number, n: number) => (n < acc ? n : acc);
const maxReducer = (acc: number, n: number) => (n > acc ? n : acc);

const sum = (source: number[]) => source.reduce(sumReducer, 0);
const min = (source: number[]) => source.reduce(minReducer, 0);
const max = (source: number[]) => source.reduce(maxReducer, 0);

const aggregates = { sum, min, max };

const fields = <T,>(fieldName: keyof T, rows: T[]) =>
  rows.map((row) => row[fieldName]);

const headerRow: AgGridReactProps["pinnedTopRowData"] = [
  { name: "Top", code: "Top", capital: "Top", population: 0 },
];

type PinnedRowsExampleProps = AgGridReactProps & {
  aggregateColumn?: string;
  aggregate?: "sum" | "min" | "max";
  showFooter?: boolean;
  showHeader?: boolean;
};

const PinnedRowsExample = ({
  aggregate = "sum",
  aggregateColumn = "population",
  columnDefs = dataGridExampleColumns,
  rowData = dataGridExampleData,
  showFooter = true,
  showHeader = true,
  ...rest
}: PinnedRowsExampleProps) => {
  const getColumnData = () => {
    if (!rowData) return [];
    return fields(aggregateColumn, rowData).filter(
      (field) => typeof field === "number",
    ) as number[];
  };

  const footerRow = () => {
    const columnData = getColumnData();
    const fn = aggregates[aggregate];
    const population = fn(columnData);
    return [{ name: "Summary", code: "", capital: "", population }];
  };

  const pinnedBottomRowData = showFooter ? footerRow() : undefined;
  const pinnedTopRowData = showHeader ? headerRow : undefined;

  return (
    <div style={V3_STORY_CONTAINER}>
      <AgGridReact
        theme={saltTheme}
        {...saltAgGridDefaults}
        {...rest}
        columnDefs={columnDefs}
        rowSelection="multiple"
        rowData={rowData}
        pinnedBottomRowData={pinnedBottomRowData}
        pinnedTopRowData={pinnedTopRowData}
        onGridReady={fitColumnsOnReady}
      />
    </div>
  );
};

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const PinnedRows = (props: PinnedRowsExampleProps) => (
  <PinnedRowsExample {...props} />
);
