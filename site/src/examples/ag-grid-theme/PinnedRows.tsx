import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { defaultColumns, defaultData } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

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

const headerRow = [
  {
    name: "Top",
    code: "Top",
    capital: "Top",
    population: "Top",
  },
];

type PinnedRowsExampleProps = AgGridReactProps & {
  aggregateColumn:
    | "code"
    | "population"
    | "name"
    | "capital"
    | "rating"
    | "date";
  aggregate: "sum" | "min" | "max";
  showFooter: boolean;
  showHeader: boolean;
};

export const PinnedRows = function PinnedRowsExample({
  aggregate = "sum",
  aggregateColumn = "population",
  showFooter = true,
  showHeader = true,
  ...rest
}: PinnedRowsExampleProps) {
  const { agGridProps, containerProps } = useAgGridHelpers();

  const getColumnData = () => {
    return fields(aggregateColumn, defaultData).filter(
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

  const getHeaderRow = () => {
    return headerRow;
  };

  const pinnedBottomRowData = showFooter ? footerRow() : undefined;
  const pinnedTopRowData = showHeader ? getHeaderRow() : undefined;

  console.log({ pinnedBottomRowData, pinnedTopRowData });
  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...rest}
        columnDefs={defaultColumns}
        rowData={defaultData}
        pinnedBottomRowData={pinnedBottomRowData}
        pinnedTopRowData={pinnedTopRowData}
      />
    </div>
  );
};
