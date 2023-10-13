import { StackLayout } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const { switcher, themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

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
    <StackLayout gap={4}>
      {switcher}
      <div {...containerProps}>
        <AgGridReact
          {...agGridProps}
          {...rest}
          columnDefs={columnDefs}
          rowData={rowData}
          pinnedBottomRowData={pinnedBottomRowData}
          pinnedTopRowData={pinnedTopRowData}
        />
      </div>
    </StackLayout>
  );
};

export default function PinnedRows(props: PinnedRowsExampleProps) {
  return <PinnedRowsExample {...props} />;
}

PinnedRows.parameters = {
  chromatic: { disableSnapshot: false, delay: 500 },
};
