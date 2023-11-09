import { useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
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

const InfiniteScroll = (props: { defaultTheme: string }) => {
    const { defaultTheme = "salt" } = props
    const { themeName, switcher } = useAgGridThemeSwitcher(defaultTheme);
  const { isGridReady, agGridProps, containerProps, api } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

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
    <StackLayout gap={4}>
      {switcher}
      <div {...containerProps}>
        <AgGridReact
          {...agGridProps}
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadingRenderer(params: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (params.value !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      return params.value;
    } else {
      return <Spinner size="default" />;
    }
  },
};

InfiniteScroll.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default InfiniteScroll;
