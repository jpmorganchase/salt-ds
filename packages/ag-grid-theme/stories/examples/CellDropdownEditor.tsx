import React, { useEffect, useState } from "react";
import "../../uitk-ag-theme.css";
import RatingDropdown from "./RatingDropdown";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@jpmorganchase/uitk-core";

/**
 * Based on the examples provided by
 * https://www.ag-grid.com/javascript-grid-cell-editor/
 * This examples uses a JPM UI Toolkit Dropdown as a cell editor
 * complete with focus and keyboard navigation support
 */
const CellDropdownEditor = (props: AgGridReactProps) => {
  const [isNewTheme, setNewTheme] = useState(false);

  const onThemeChange = () => {
    setNewTheme(!isNewTheme);
  };

  const [columnDefs] = useState<ColDef[]>([
    { headerName: "Name", field: "name" },
    { headerName: "Code", field: "code", minWidth: 120 },
    { headerName: "Capital", field: "capital" },
    { headerName: "Population", field: "population" },
    {
      headerName: "Rating",
      field: "rating",
      editable: true,
      cellEditor: RatingDropdown,
      cellEditorPopup: true,
      suppressKeyboardEvent: (params) => params.editing,
      width: 100,
    },
  ]);

  const { isGridReady, agGridProps, containerProps, api } = useAgGridHelpers(
    isNewTheme ? "ag-theme-odyssey" : undefined
  );

  const [rowData] = useState(dataGridExampleData);

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
    }
  }, [isGridReady]);

  const onBodyScroll = () => {
    api?.stopEditing();
  };

  return (
    <div>
      <Switch checked={isNewTheme} onChange={onThemeChange} label="New theme" />
      <div style={{ height: 800, width: 800 }} {...containerProps}>
        <AgGridReact
          columnDefs={columnDefs}
          onBodyScroll={onBodyScroll}
          {...agGridProps}
          {...props}
          rowData={rowData}
        />
      </div>
    </div>
  );
};

export default CellDropdownEditor;
