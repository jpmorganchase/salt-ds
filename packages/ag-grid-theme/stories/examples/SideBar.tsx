import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useMemo } from "react";
import { StackLayout } from "@salt-ds/core";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const SideBar = (props: AgGridReactProps) => {
  const { themeName, switcher } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  const sideBar = useMemo(() => {
    return {
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
      ],
      defaultToolPanel: "customStats",
    };
  }, []);

  return (
    <StackLayout gap={4}>
      {switcher}
      <div {...containerProps}>
        <AgGridReact
          rowData={dataGridExampleData}
          columnDefs={dataGridExampleColumns}
          rowSelection="single"
          {...agGridProps}
          {...props}
          sideBar={sideBar}
        />
      </div>
    </StackLayout>
  );
};

SideBar.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default SideBar;
