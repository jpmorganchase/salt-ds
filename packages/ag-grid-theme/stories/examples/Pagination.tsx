import React, { useEffect, useState } from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@salt-ds/lab";

const generateData = (states: typeof dataGridExampleData) =>
  states.reduce((result, row) => {
    const data = [];
    data.push(row);
    for (let i = 0; i < 20; i++) {
      data.push({ ...row, name: `${row.name} ${i}` });
    }
    return [...result, ...data];
  }, [] as typeof dataGridExampleData);

const PagedGrid = (props: AgGridReactProps) => {
  const [isSaltTheme, setSaltTheme] = useState(false);

  const onThemeChange = () => {
    setSaltTheme(!isSaltTheme);
  };

  const { isGridReady, api, agGridProps, containerProps } = useAgGridHelpers(
    isSaltTheme ? "ag-theme-salt" : undefined
  );

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [isGridReady]);

  return (
    <div>
      <div>
        <Switch
          checked={isSaltTheme}
          onChange={onThemeChange}
          label="Salt AG Grid theme"
        />
      </div>
      <div style={{ width: 900, height: 526 }} {...containerProps}>
        <AgGridReact
          columnDefs={dataGridExampleColumns}
          pagination
          paginationPageSize={100}
          rowData={generateData(dataGridExampleData)}
          {...agGridProps}
          {...props}
        />
      </div>
    </div>
  );
};

const Pagination = () => (
  <div
    style={{
      marginTop: "-150px",
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <PagedGrid />
  </div>
);

export default Pagination;
