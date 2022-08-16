import React, { CSSProperties, useEffect, useRef, useState } from "react";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { Button, Card } from "@jpmorganchase/uitk-core";
import { WarningIcon } from "@jpmorganchase/uitk-icons";
import "../../uitk-ag-theme.css";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const NoDataOverlayExample = function NoDataOverlayExample(
  props: AgGridReactProps
) {
  const [showModal, setShowModal] = useState(true);
  const [position, setPosition] = useState<
    Pick<CSSProperties, "top" | "left" | "width" | "height">
  >({
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const { isGridReady, api, agGridProps, containerProps } = useAgGridHelpers();
  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
      const container = containerRef.current!;
      const {
        offsetTop: top,
        clientWidth: width,
        offsetLeft: left,
        clientHeight: height,
      } = container;
      setPosition({ top, left, width, height });
    }
  }, [isGridReady]);

  const reloadData = () => {
    setShowModal(false);
  };

  const handleHide = () => {
    setShowModal(false);
  };

  const getModalStyle: CSSProperties = {
    position: "absolute",
    top: position.top,
    width: "100%",
    left: position.left,
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
      <Card
        data-jpmui-test="card-default-example"
        style={{
          width: "500px",
          height: "160px",
          position: "relative",
          padding: 0,
          borderBottom: `8px solid red`,
        }}
      >
        <div>
          <div
            aria-atomic="true"
            aria-live="polite"
            style={{
              fontSize: "16px",
              position: "relative",
              top: 0,
            }}
            tabIndex={0}
          >
            <div aria-atomic="true" style={{ textAlign: "left" }}>
              <WarningIcon
                aria-label="alert"
                size={20}
                style={{ color: "red", marginRight: 5 }}
              />
              <h2 style={{ display: "inline" }}>No data to display</h2>
              <p
                style={{
                  textAlign: "left",
                  fontSize: "12px",
                  lineHeight: "1.5em",
                }}
              >
                We didn&apos;t find any row data to display. Please try
                reloading the page or contacting your local help desk.
              </p>
            </div>
            <div style={{ position: "absolute", right: "0" }}>
              <Button
                aria-label="help desk"
                style={{ marginRight: 10, border: "1px solid" }}
                variant="secondary"
              >
                Help Desk
              </Button>
              <Button aria-label="reload" onClick={reloadData} variant="cta">
                Reload
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div
      style={{ marginTop: 25, position: "relative" }}
      ref={containerRef}
      tabIndex={0}
    >
      {modal}
      <div style={{ height: 800, width: 800 }} {...containerProps}>
        <AgGridReact {...agGridProps} {...props} />
      </div>
    </div>
  );
};

NoDataOverlayExample.defaultProps = {
  columnDefs: dataGridExampleColumns,
};

export default function NoDataOverlay(props: AgGridReactProps) {
  return <NoDataOverlayExample {...props} />;
}
