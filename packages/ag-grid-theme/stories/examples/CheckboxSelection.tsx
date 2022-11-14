import React, { useEffect, useState } from "react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import "../../uitk-ag-theme.css";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@jpmorganchase/uitk-core";

const headerOn = {
  headerName: "On",
  field: "on",
  checkboxSelection: true,
  headerCheckboxSelection: true,
};

const [headerName, , headerCapital] = dataGridExampleColumns;

const CheckboxSelectionExample = function CheckboxSelectionExample(
  props: AgGridReactProps
) {
  const [isNewTheme, setNewTheme] = useState(false);

  const onThemeChange = () => {
    setNewTheme(!isNewTheme);
  };

  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers(
    isNewTheme ? "ag-theme-odyssey" : undefined
  );

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
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
        <AgGridReact {...agGridProps} {...props} />
      </div>
    </div>
  );
};

CheckboxSelectionExample.defaultProps = {
  columnDefs: [headerOn, headerName, headerCapital],
  rowData: dataGridExampleData,
};

export default function CheckboxSelection(props: AgGridReactProps) {
  return <CheckboxSelectionExample {...props} />;
}
