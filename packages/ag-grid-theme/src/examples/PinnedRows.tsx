import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

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
  const { agGridProps, containerProps } = useAgGridHelpers();

  const getColumnData = () => {
    return fields(aggregateColumn, rowData!).filter(
      (field) => typeof field === "number"
    ) as number[];
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

  const pinnedBottomRowData = showFooter ? footerRow() : undefined;
  const pinnedTopRowData = showHeader ? headerRow : undefined;
  return (
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
  );
};

export default function PinnedRows(props: PinnedRowsExampleProps) {
  return <PinnedRowsExample {...props} />;
}
