import React, { useEffect } from "react";
import "../../uitk-ag-theme.css";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { Button } from "@jpmorganchase/uitk-core";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const RefreshGridContentExample = function RefreshGridContentExample(
  props: AgGridReactProps
) {
  const { agGridProps, containerProps, isGridReady, api } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [isGridReady]);

  const onUpdateSomeValues = () => {
    const rowCount = api!.getDisplayedRowCount();
    for (let i = 0; i < 20; i++) {
      const row = Math.floor(Math.random() * rowCount);
      const rowNode = api!.getDisplayedRowAtIndex(row)!;
      const col = ["a", "b", "c", "d", "e", "f"][i % 6];
      rowNode.setDataValue(col, Math.floor(Math.random() * 10000));
    }
  };

  const onFlashOneCell = () => {
    const rowNode = api!.getDisplayedRowAtIndex(4)!;
    api!.flashCells({
      rowNodes: [rowNode],
      columns: ["c"],
    });
  };

  const onFlashTwoColumns = () => {
    api!.flashCells({
      columns: ["c", "d"],
    });
  };

  const onFlashTwoRows = () => {
    const rowNode1 = api!.getDisplayedRowAtIndex(4)!;
    const rowNode2 = api!.getDisplayedRowAtIndex(5)!;
    api!.flashCells({
      rowNodes: [rowNode1, rowNode2],
    });
  };

  return (
    <div>
      <Button onClick={onUpdateSomeValues}>Update Some Data</Button>
      &nbsp;&nbsp;&nbsp;
      <Button onClick={onFlashOneCell}>Flash One Cell</Button>
      &nbsp;&nbsp;&nbsp;
      <Button onClick={onFlashTwoRows}>Flash Two Rows</Button>
      &nbsp;&nbsp;&nbsp;
      <Button onClick={onFlashTwoColumns}>Flash Two Columns</Button>
      <div
        style={{ marginTop: 25, height: 800, width: 800 }}
        {...containerProps}
      >
        <AgGridReact
          columnDefs={props.columnDefs}
          masterDetail
          {...agGridProps}
          {...props}
        />
      </div>
    </div>
  );
};

function createRowData() {
  const rowData = [];
  for (let i = 0; i < 20; i++) {
    rowData.push({
      a: Math.floor(((i + 323) * 25435) % 10000),
      b: Math.floor(((i + 323) * 23221) % 10000),
      c: Math.floor(((i + 323) * 468276) % 10000),
      d: 0,
      e: 0,
      f: 0,
    });
  }
  return rowData;
}

RefreshGridContentExample.defaultProps = {
  columnDefs: [
    {
      headerName: "A",
      field: "a",
    },
    {
      headerName: "B",
      field: "b",
    },
    {
      headerName: "C",
      field: "c",
    },
    {
      headerName: "D",
      field: "d",
    },
    {
      headerName: "E",
      field: "e",
    },
    {
      headerName: "F",
      field: "f",
    },
  ],
  rowData: createRowData(),
  enableCellChangeFlash: true,
};

export default function RefreshGridContent(props: AgGridReactProps) {
  return <RefreshGridContentExample {...props} />;
}
