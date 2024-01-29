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

export const InfiniteScroll = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes. For complete example check the `Default` example.
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
  }, [api, isGridReady]);

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadingRenderer(params: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (params.value !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return params.value;
    } else {
      return <Spinner size="default" />;
    }
  },
};
