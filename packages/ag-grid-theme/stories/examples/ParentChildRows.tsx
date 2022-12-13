import React, { useEffect, useState } from "react";
import parentChildExampleColumns from "../dependencies/parentChildExampleColumns";
import parentChildExampleData from "../dependencies/parentChildExampleData";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import "../../uitk-ag-theme.css";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@jpmorganchase/uitk-lab";

const ParentChildRows = (props: AgGridReactProps) => {
  const [isNewTheme, setNewTheme] = useState(false);

  const onThemeChange = () => {
    setNewTheme(!isNewTheme);
  };

  const { isGridReady, api, agGridProps, containerProps } = useAgGridHelpers(
    isNewTheme ? "ag-theme-odyssey" : undefined
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
          checked={isNewTheme}
          onChange={onThemeChange}
          label="New theme"
        />
      </div>
      <div
        style={{ marginTop: 25, height: 800, width: 800 }}
        {...containerProps}
      >
        <AgGridReact
          animateRows
          treeData
          {...agGridProps}
          {...props}
          columnDefs={parentChildExampleColumns}
          getDataPath={(data: any) => {
            return data.orgHierarchy;
          }}
          groupDefaultExpanded={-1}
          rowData={parentChildExampleData}
        />
      </div>
    </div>
  );
};

export default ParentChildRows;
