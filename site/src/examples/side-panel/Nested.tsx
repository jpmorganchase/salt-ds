import {
  Button,
  FlexLayout,
  H2,
  StackLayout,
  Text,
  useIcon,
  useId,
} from "@salt-ds/core";
import {
  SidePanel,
  SidePanelProvider,
  SidePanelTrigger,
  useSidePanelContext,
} from "@salt-ds/lab";
import type { CSSProperties } from "react";

const OUTER_PANEL_WIDTH = 500;
const INNER_PANEL_WIDTH = 200;

const outerPanelStyle = {
  "--saltSidePanel-width": `${OUTER_PANEL_WIDTH}px`,
} as CSSProperties;

const innerPanelStyle = {
  "--saltSidePanel-width": `${INNER_PANEL_WIDTH}px`,
} as CSSProperties;

const InnerPanel = () => {
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();
  return (
    <SidePanel
      aria-labelledby={headingId}
      style={innerPanelStyle}
      variant="tertiary"
    >
      <StackLayout gap={1}>
        <FlexLayout align="center">
          <H2 id={headingId} style={{ flex: 1 }}>
            Nested Panel
          </H2>
          <Button
            aria-label="Close"
            appearance="transparent"
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden />
          </Button>
        </FlexLayout>
        <Text>This panel is nested inside the right panel.</Text>
      </StackLayout>
    </SidePanel>
  );
};

const OuterPanel = () => {
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();

  return (
    <SidePanel
      aria-labelledby={headingId}
      style={outerPanelStyle}
      variant="secondary"
    >
      <SidePanelProvider>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            height: "calc(100% + 2 * var(--salt-spacing-300))",
            margin: "calc(-1 * var(--salt-spacing-300))",
            marginLeft: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflow: "auto",
              padding: "var(--salt-spacing-300)",
            }}
          >
            <StackLayout gap={1}>
              <FlexLayout align="center">
                <H2 id={headingId} style={{ flex: 1 }}>
                  Right Panel
                </H2>
                <Button
                  aria-label="Close"
                  appearance="transparent"
                  onClick={() => setOpen(false)}
                >
                  <CloseIcon aria-hidden />
                </Button>
              </FlexLayout>
              <Text>Content of the right panel.</Text>
              <SidePanelTrigger>
                <Button style={{ width: "fit-content" }}>
                  Toggle nested panel
                </Button>
              </SidePanelTrigger>
            </StackLayout>
          </div>
          <InnerPanel />
        </div>
      </SidePanelProvider>
    </SidePanel>
  );
};

export const Nested = () => (
  <div
    style={{
      width: "100%",
      height: 300,
      display: "flex",
      border:
        "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
      borderRadius: "var(--salt-palette-corner-weak)",
      overflow: "hidden",
    }}
  >
    <SidePanelProvider>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "start",
          padding: "var(--salt-spacing-200)",
        }}
      >
        <SidePanelTrigger>
          <Button style={{ whiteSpace: "nowrap" }}>Toggle right panel</Button>
        </SidePanelTrigger>
      </div>
      <OuterPanel />
    </SidePanelProvider>
  </div>
);
