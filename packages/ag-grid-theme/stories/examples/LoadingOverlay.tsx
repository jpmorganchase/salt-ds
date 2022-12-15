import React, { CSSProperties, useEffect, useRef, useState } from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { Card, Switch, Spinner } from "@salt-ds/lab";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const LoadingOverlay = (props: AgGridReactProps) => {
  const [showModal, setShowModal] = useState(true);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const [width, setWidth] = useState<number | string>("100%");
  const [height, setHeight] = useState<number | string>("100%");

  const gridRef = useRef<HTMLDivElement>(null);

  const [isSaltTheme, setSaltTheme] = useState(false);

  const onThemeChange = () => {
    setSaltTheme(!isSaltTheme);
  };

  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers(
    isSaltTheme ? "ag-theme-salt" : undefined
  );

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
      const { offsetTop, clientWidth, offsetLeft, clientHeight } =
        gridRef.current!;
      setTop(offsetTop);
      setLeft(offsetLeft);
      setHeight(clientHeight);
      setWidth(clientWidth);
    }
  }, [isGridReady]);

  const getModalStyle: CSSProperties = {
    position: "absolute",
    top,
    width: "100%",
    left,
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    zIndex: "3",
    textAlign: "center",
  };

  const modal = showModal && (
    <div className="modal" style={getModalStyle}>
      <Card>
        <div>
          <Spinner style={{ margin: "0 auto" }} />
          <div
            aria-atomic="true"
            aria-live="polite"
            style={{ fontSize: "16px", marginTop: "18px" }}
            tabIndex={0}
          >
            Loading...
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div>
      <div>
        <Switch
          checked={isSaltTheme}
          onChange={onThemeChange}
          label="Salt AG Grid theme"
        />
      </div>
      <div style={{ marginTop: 25, position: "relative" }}>
        {modal}
        <div
          style={{ height: 800, width: 800 }}
          {...containerProps}
          ref={gridRef}
          tabIndex={-1}
        >
          <AgGridReact
            {...agGridProps}
            {...props}
            columnDefs={dataGridExampleColumns}
            rowData={dataGridExampleData}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
