import { CSSProperties, useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button, Card, H2, StatusIndicator } from "@salt-ds/core";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const NoDataOverlay = (props: { defaultTheme: string }) => {
    const [showModal, setShowModal] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const { defaultTheme = "salt" } = props
    const { themeName, switcher } = useAgGridThemeSwitcher(defaultTheme);
  const { isGridReady, api, agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [api, isGridReady]);

  const reloadData = () => {
    setShowModal(false);
  };

  const getModalStyle: CSSProperties = {
    position: "absolute",
    top: "50%",
    width: "100%",
    left: "50%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    zIndex: "3",
    textAlign: "center",
    transform: "translate(-50%, -50%)",
  };

  const modal = showModal && (
    <div className="modal" style={getModalStyle}>
      <Card
        data-jpmui-test="card-default-example"
        style={{
          minHeight: "auto",
          width: "500px",
          height: "160px",
          position: "relative",
          padding: 0,
          border: `var(--salt-size-border) var(--salt-container-borderStyle) var(--salt-status-error-borderColor)`,
        }}
      >
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
            <div
              style={{
                alignItems: "center",
                gap: "var(--salt-spacing-100)",
                display: "flex",
                height: "var(--salt-text-h2-lineHeight",
              }}
            >
              <StatusIndicator
                style={
                  {
                    "--saltIcon-size": "var(--salt-text-h2-lineHeight)",
                  } as CSSProperties
                }
                status={"error"}
              />
              <H2 style={{ display: "inline" }}>No data to display</H2>
            </div>
            <p
              style={{
                textAlign: "left",
                fontSize: "12px",
                lineHeight: "1.5em",
              }}
            >
              We didn&apos;t find any row data to display. Please try reloading
              the page or contacting your local help desk.
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
      </Card>
    </div>
  );

  return (
    <div>
      {switcher}
      <div
        style={{ marginTop: 25, position: "relative" }}
        ref={containerRef}
        tabIndex={0}
      >
        {modal}
        <div style={{ height: 800, width: 800 }} {...containerProps}>
          <AgGridReact
            {...agGridProps}
            columnDefs={dataGridExampleColumns}
          />
        </div>
      </div>
    </div>
  );
};

NoDataOverlay.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default NoDataOverlay;
