import { Spinner, useDensity } from "@salt-ds/core";
import type { IDatasource } from "ag-grid-community";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridInfiniteScrollExampleColumns from "../dependencies/dataGridInfiniteScrollExampleColumns";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const generateData = function generateData<T extends { name: string }>(
  lst: T[],
) {
  return lst.reduce((result, row) => {
    const data = [];
    data.push(row);
    for (let i = 0; i < 20; i++) {
      const o = { ...row, name: `${row.name} ${i}` };
      data.push(o);
    }
    return result.concat(data);
  }, [] as T[]);
};

const dataSourceRows = generateData(dataGridExampleData);

const datasource: IDatasource = {
  getRows: ({ startRow, endRow, successCallback }) => {
    setTimeout(() => {
      successCallback(
        dataSourceRows.slice(startRow, endRow),
        dataSourceRows.length,
      );
    }, 500);
  },
};

const InfiniteScroll = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();
  const density = useDensity();
  // The infinite row model reacts to rowHeight changes, but not CSS height changes.
  const rowHeight = {
    high: 25,
    medium: 37,
    low: 49,
    touch: 61,
    mobile: 61,
  }[density];

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        rowHeight={rowHeight}
        {...props}
        columnDefs={dataGridInfiniteScrollExampleColumns}
        rowModelType="infinite"
        datasource={datasource}
        infiniteInitialRowCount={100}
        components={infiniteScrollComponents}
      />
    </div>
  );
};

const infiniteScrollComponents = {
  loadingRenderer(params: { value: unknown }) {
    if (params.value !== undefined) {
      return params.value;
    }
    return <Spinner size="default" />;
  },
};

export default InfiniteScroll;
