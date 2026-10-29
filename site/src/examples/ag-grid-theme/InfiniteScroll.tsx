import { Spinner } from "@salt-ds/core";
import type { IDatasource } from "ag-grid-community";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultData, infiniteScrollColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

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

const dataSourceRows = generateData(defaultData);

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

export const InfiniteScroll = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        columnDefs={infiniteScrollColumns}
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
    return <Spinner size="medium" />;
  },
};
