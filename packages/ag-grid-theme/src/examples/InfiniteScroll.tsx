import { Spinner } from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { useEffect } from "react";
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

const InfiniteScroll = (props: AgGridReactProps) => {
  const { isGridReady, agGridProps, containerProps, api } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();

      api?.setGridOption("datasource", {
        getRows: ({ startRow, endRow, successCallback }) => {
          setTimeout(() => {
            successCallback(
              dataSourceRows.slice(startRow, endRow),
              dataSourceRows.length,
            );
          }, 500);
        },
      });
    }
  }, [isGridReady, api]);

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        columnDefs={dataGridInfiniteScrollExampleColumns}
        rowModelType="infinite"
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
