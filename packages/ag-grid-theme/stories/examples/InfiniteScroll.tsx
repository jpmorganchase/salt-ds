import React, { useEffect, useState } from "react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridInfiniteScrollExampleColumns from "../dependencies/dataGridInfiniteScrollExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import "../../uitk-ag-theme.css";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@salt-ds/lab";

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
  const [isNewTheme, setNewTheme] = useState(false);

  const onThemeChange = () => {
    setNewTheme(!isNewTheme);
  };

  const { isGridReady, agGridProps, containerProps, api } = useAgGridHelpers(
    isNewTheme ? "ag-theme-salt" : undefined
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
    <div>
      <div>
        <Switch
          checked={isNewTheme}
          onChange={onThemeChange}
          label="Salt AG Grid theme"
        />
      </div>
      <div
        style={{ marginTop: 25, height: 800, width: 800 }}
        {...containerProps}
      >
        <AgGridReact
          {...agGridProps}
          {...props}
          columnDefs={dataGridInfiniteScrollExampleColumns}
          rowModelType="infinite"
          infiniteInitialRowCount={100}
          components={infiniteScrollComponents}
        />
      </div>
    </div>
  );
};

const infiniteScrollComponents = {
  loadingRenderer(params: any) {
    if (params.value !== undefined) {
      return params.value;
    } else {
      return '<div aria-label="loading" class="jpm-ui-toolkit-cssSpinner small" role="status"><div class="dot1"></div><div class="dot2"></div><div class="dot3"></div></div>';
    }
  },
};

export default InfiniteScroll;
