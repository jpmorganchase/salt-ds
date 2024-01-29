import { AgGridReact } from "ag-grid-react";
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

const PagedGrid = (props: { defaultTheme: string }) => {
  const { defaultTheme = "salt" } = props;
  const { themeName, switcher } = useAgGridThemeSwitcher(defaultTheme);
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
        />
      </div>
    </StackLayout>
  );
};

const Pagination = (props: { defaultTheme: string }) => {
  const { defaultTheme = "salt" } = props;
  return (
    <div
      style={{
        marginTop: "-150px",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PagedGrid defaultTheme={defaultTheme} />
    </div>
  );
};

Pagination.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default Pagination;
