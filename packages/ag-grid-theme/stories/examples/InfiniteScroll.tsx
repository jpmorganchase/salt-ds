import { useEffect } from "react";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { Spinner, StackLayout } from "@salt-ds/core";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridInfiniteScrollExampleColumns from "../dependencies/dataGridInfiniteScrollExampleColumns";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

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

const dataSourceRows = generateData(dataGridExampleData);

const InfiniteScroll = (props: AgGridReactProps) => {
  const { switcher, themeName } = useAgGridThemeSwitcher();
  const { isGridReady, agGridProps, containerProps, api } = useAgGridHelpers(
    `ag-theme-${themeName}`
  );

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
    <StackLayout gap={4}>
      {switcher}
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
    </StackLayout>
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

InfiniteScroll.parameters = {
  chromatic: { disableSnapshot: false },
};

export default InfiniteScroll;
