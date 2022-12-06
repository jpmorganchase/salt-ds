import React, { useEffect, useState } from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@jpmorganchase/uitk-core";

const sumReducer = (acc: number, n: number) => acc + n;
const minReducer = (acc: number, n: number) => (n < acc ? n : acc);
const maxReducer = (acc: number, n: number) => (n > acc ? n : acc);

const sum = (source: number[]) => source.reduce(sumReducer, 0);
const min = (source: number[]) => source.reduce(minReducer, 0);
const max = (source: number[]) => source.reduce(maxReducer, 0);

export const aggregates = {
  sum,
  min,
  max,
};

const fields = function <T>(fieldName: keyof T, rows: T[]) {
  return rows.map((row) => row[fieldName]);
};

const headerRow: any[] = [
  {
    name: "Top",
    code: "Top",
    capital: "Top",
    population: "Top",
  },
];

type PinnedRowsExampleProps = AgGridReactProps & {
  aggregateColumn: string;
  aggregate: "sum" | "min" | "max";
  showFooter: boolean;
  showHeader: boolean;
};

const PinnedRowsExample = function PinnedRowsExample({
  aggregate = "sum",
  aggregateColumn = "population",
  columnDefs = dataGridExampleColumns,
  rowData = dataGridExampleData,
  showFooter = true,
  showHeader = true,
  ...rest
}: PinnedRowsExampleProps) {
  const [isNewTheme, setNewTheme] = useState(false);

  const onThemeChange = () => {
    setNewTheme(!isNewTheme);
  };

  const { isGridReady, api, agGridProps, containerProps } = useAgGridHelpers(
    isNewTheme ? "ag-theme-odyssey" : undefined
  );

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [isGridReady]);

  const getColumnData = () => {
    return fields(aggregateColumn, rowData!).filter(
      (field) => typeof field === "number"
    );
  };

  const footerRow = () => {
    const columnData = getColumnData();
    const fn = aggregates[aggregate];
    const population = fn(columnData);
    return [
      {
        name: "Summary",
        code: "",
        capital: "",
        population,
      },
    ];
  };

  const getHeaderRow = () => {
    return headerRow;
  };

  const pinnedBottomRowData = showFooter ? footerRow() : undefined;
  const pinnedTopRowData = showHeader ? getHeaderRow() : undefined;
  return (
    <div>
      <div>
        <Switch
          checked={isNewTheme}
          onChange={onThemeChange}
          label="New theme"
        />
      </div>
      <div
        style={{ marginTop: 25, height: 800, width: 800 }}
        {...containerProps}
      >
        <AgGridReact
          {...agGridProps}
          {...rest}
          columnDefs={columnDefs}
          rowData={rowData}
          pinnedBottomRowData={pinnedBottomRowData}
          pinnedTopRowData={pinnedTopRowData}
        />
      </div>
    </div>
  );
};

export default function PinnedRows(props: PinnedRowsExampleProps) {
  return <PinnedRowsExample {...props} />;
}
