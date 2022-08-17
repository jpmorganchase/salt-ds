import React, { useEffect } from "react";
import PropTypes from "prop-types";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
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

const PinnedRowsExample = function PinnedRowsExample(
  props: PinnedRowsExampleProps
) {
  const { isGridReady, api, agGridProps, containerProps } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [isGridReady]);

  const getColumnData = () => {
    return fields(props.aggregateColumn, props.rowData!).filter(
      (field) => typeof field === "number"
    );
  };

  const footerRow = () => {
    const columnData = getColumnData();
    const fn = aggregates[props.aggregate];
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

  const pinnedBottomRowData = props.showFooter ? footerRow() : undefined;
  const pinnedTopRowData = props.showHeader ? getHeaderRow() : undefined;
  return (
    <div style={{ marginTop: 25, height: 800, width: 800 }} {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        pinnedBottomRowData={pinnedBottomRowData}
        pinnedTopRowData={pinnedTopRowData}
      />
    </div>
  );
};

PinnedRowsExample.propTypes = {
  aggregate: PropTypes.string,
  aggregateColumn: PropTypes.string,
  rowData: PropTypes.arrayOf(PropTypes.object),
  showFooter: PropTypes.bool,
  showHeader: PropTypes.bool,
};

PinnedRowsExample.defaultProps = {
  aggregate: "sum",
  aggregateColumn: "population",
  columnDefs: dataGridExampleColumns,
  rowData: dataGridExampleData,
  showFooter: true,
  showHeader: true,
};

export default function PinnedRows(props: PinnedRowsExampleProps) {
  return <PinnedRowsExample {...props} />;
}
