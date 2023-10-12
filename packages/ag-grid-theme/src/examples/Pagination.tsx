import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

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
  const { themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
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
