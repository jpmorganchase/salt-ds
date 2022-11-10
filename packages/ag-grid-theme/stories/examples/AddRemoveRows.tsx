import React, { useState } from "react";

import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
// ideally these css files would be loaded from a link tag
// pointing to static asset directory for caching
import { ColDef } from "ag-grid-community";
import { Button, Switch } from "@jpmorganchase/uitk-core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import "../../uitk-ag-theme.css";
import "../../odyssey-ag-theme.css";

export const AddRemoveRows = (props: AgGridReactProps) => {
  const [isNewTheme, setNewTheme] = useState(false);

  const onThemeChange = () => {
    setNewTheme(!isNewTheme);
  };

  const { containerProps, agGridProps, api, columnApi } = useAgGridHelpers(
    isNewTheme ? "ag-theme-odyssey" : undefined
  );

  const [columnDefs] = useState<ColDef[]>(dataGridExampleColumns);

  const [defaultColDef] = useState<ColDef>({
    editable: true,
  });
  const [disabledButton, setDisabledButton] = useState<boolean>(true);

  const handleAddRow = () => {
    const addRowButton = document.querySelector(
      '[data-button="addRow"]'
    ) as HTMLButtonElement;
    addRowButton.blur();
    api!.ensureIndexVisible(0, "top");
    api!.updateRowData({
      add: [
        {
          name: "",
          code: "",
          capital: "",
          population: "",
        },
      ],
      addIndex: 0,
    });
    const firstColumn = columnApi!.getAllColumns()![0].getColId();
    api!.setFocusedCell(0, firstColumn, "top");
    setTimeout(() => {
      api!.startEditingCell({
        rowIndex: 0,
        colKey: firstColumn,
      });
    }, 50);
  };

  const handleRemoveSelected = () => {
    const rowNumber = api!.getSelectedNodes()[0].rowIndex as number;
    const firstColumn = columnApi!.getAllColumns()![0].getColId();
    api!.setFocusedCell(rowNumber, firstColumn, "top");
    api!.updateRowData({ remove: api!.getSelectedRows() });
    setTimeout(() => {
      api!.startEditingCell({
        rowIndex: rowNumber,
        colKey: firstColumn,
      });
    }, 50);
  };

  const onSelectionChanged = () => {
    api!.getSelectedRows().length !== 0
      ? setDisabledButton(false)
      : setDisabledButton(true);
  };

  return (
    <div style={{ marginTop: 25 }}>
      <div>
        <Switch
          checked={isNewTheme}
          onChange={onThemeChange}
          label="New theme"
        />
      </div>
      <div
        style={{ height: 400, width: 820, marginBottom: 25 }}
        {...containerProps}
      >
        <AgGridReact
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onSelectionChanged={onSelectionChanged}
          rowData={dataGridExampleData}
          {...agGridProps}
          {...props}
        />
      </div>
      <Button
        aria-label="add row"
        data-button="addRow"
        onClick={handleAddRow}
        style={{ marginRight: 10 }}
        tabIndex={0}
      >
        Add Row
      </Button>
      <Button
        aria-label="remove row"
        disabled={disabledButton}
        onClick={handleRemoveSelected}
        tabIndex={0}
      >
        Remove Row
      </Button>
    </div>
  );
};
