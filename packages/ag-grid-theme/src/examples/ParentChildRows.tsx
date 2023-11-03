import { StackLayout } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import parentChildExampleColumns from "../dependencies/parentChildExampleColumns";
import parentChildExampleData from "../dependencies/parentChildExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const ParentChildRows = (props: AgGridReactProps) => {
  const { switcher, themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
    <StackLayout gap={4}>
      {switcher}
      <div {...containerProps}>
        <AgGridReact
          animateRows
          treeData
          {...agGridProps}
          {...props}
          columnDefs={parentChildExampleColumns}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          getDataPath={(data: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
            return data.orgHierarchy;
          }}
          groupDefaultExpanded={-1}
          rowData={parentChildExampleData}
        />
      </div>
    </StackLayout>
  );
};

ParentChildRows.parameters = {
  chromatic: { disableSnapshot: false, delay: 1000 },
};

export default ParentChildRows;
