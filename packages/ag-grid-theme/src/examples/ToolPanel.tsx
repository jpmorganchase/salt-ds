import { FlexLayout, Text } from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const CustomPanel = () => {
  return (
    <FlexLayout
      style={{
        background: "var(--salt-container-secondary-background",
        height: "calc(10* var(--salt-size-base))",
      }}
      align="center"
      justify="center"
      direction="column"
    >
      <Text styleAs="h2">Custom panel</Text>
      <Text>Width should auto fit</Text>
    </FlexLayout>
  );
};

const sideBar = {
  toolPanels: [
    {
      id: "columns",
      labelDefault: "Columns",
      labelKey: "columns",
      iconKey: "columns",
      toolPanel: "agColumnsToolPanel",
    },
    {
      id: "filters",
      labelDefault: "Filters",
      labelKey: "filters",
      iconKey: "filter",
      toolPanel: "agFiltersToolPanel",
    },
    {
      id: "customStats",
      labelDefault: "Custom Stats",
      labelKey: "customStats",
      iconKey: "save",
      toolPanel: CustomPanel,
    },
  ],
  defaultToolPanel: "customStats",
};

const ToolPanel = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        columnDefs={[
          {
            headerName: "Name",
            field: "name",
            filterParams: {
              buttons: ["reset", "apply"],
            },
            editable: false,
          },
          {
            headerName: "Code",
            field: "code",
          },
          {
            headerName: "Capital",
            field: "capital",
            tooltipField: "capital",
            headerTooltip: "Capital",
          },
        ]}
        rowData={dataGridExampleData}
        rowSelection="single"
        cellSelection={true}
        sideBar={sideBar}
      />
    </div>
  );
};

export default ToolPanel;
