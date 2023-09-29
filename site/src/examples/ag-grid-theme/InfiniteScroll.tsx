import { useEffect } from "react";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { Spinner } from "@salt-ds/core";
import { infiniteScrollColumns, defaultData } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

const generateData = function generateData<T extends { name: string }>(
  lst: T[]
) {
  return lst.reduce((result, row) => {
    const data = [];
    data.push(row);
    for (let i = 0; i < 20; i++) {
      const o = { ...row, name: `${row.name} ${i}` };
      data.push(o);
    }
    return [...result, ...data];
  }, [] as T[]);
};

const dataSourceRows = generateData(defaultData);

const InfiniteScroll = (props: AgGridReactProps) => {
  const { isGridReady, agGridProps, containerProps, api } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();

      api!.setDatasource({
        getRows: ({ startRow, endRow, successCallback }) => {
          setTimeout(() => {
            successCallback(
              dataSourceRows.slice(startRow, endRow),
              dataSourceRows.length
            );
          }, 500);
        },
      });
    }
  }, [isGridReady]);

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        columnDefs={infiniteScrollColumns}
        rowModelType="infinite"
        infiniteInitialRowCount={100}
        components={infiniteScrollComponents}
      />
    </div>
  );
};

const infiniteScrollComponents = {
  loadingRenderer(params: any) {
    if (params.value !== undefined) {
      return params.value;
    } else {
      return <Spinner size="default" />;
    }
  },
};

export default InfiniteScroll;
