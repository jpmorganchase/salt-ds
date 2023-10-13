import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { StackLayout } from "@salt-ds/core";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

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
  const { switcher, themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
    <StackLayout gap={4}>
      {switcher}
      <div {...containerProps}>
        <AgGridReact
          columnDefs={dataGridExampleColumns}
          pagination
          paginationPageSize={100}
          rowData={generateData(dataGridExampleData)}
          {...agGridProps}
          {...props}
        />
      </div>
    </StackLayout>
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

Pagination.parameters = {
  chromatic: { disableSnapshot: false, delay: 500 },
};

export default Pagination;
