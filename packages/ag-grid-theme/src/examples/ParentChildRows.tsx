import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import parentChildExampleColumns from "../dependencies/parentChildExampleColumns";
import parentChildExampleData from "../dependencies/parentChildExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const ParentChildRows = (props: AgGridReactProps) => {
  const { themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
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
  );
};

ParentChildRows.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default ParentChildRows;
