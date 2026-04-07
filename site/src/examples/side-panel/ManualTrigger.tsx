import {
  Button,
  FlexLayout,
  H2,
  StackLayout,
  Text,
  useIcon,
  useId,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import {
  SidePanel,
  SidePanelProvider,
  SidePanelTrigger,
  useSidePanelContext,
} from "@salt-ds/lab";
import type { CSSProperties } from "react";

const panelStyle = {
  "--saltSidePanel-width": "200px",
} as CSSProperties;

const RightPanel = () => {
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();
  return (
    <SidePanel
      aria-labelledby={headingId}
      style={panelStyle}
      variant="secondary"
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
        <Text>Right panel content.</Text>
      </StackLayout>
    </SidePanel>
  );
};

const LeftPanel = () => {
  const headingId = useId();
  const { setOpen } = useSidePanelContext();
  return (
    <SidePanel
      position="left"
      aria-labelledby={headingId}
      style={panelStyle}
      variant="secondary"
    >
      <StackLayout gap={1}>
        <FlexLayout align="center">
          <H2 id={headingId} style={{ flex: 1 }}>
            Left Panel
          </H2>
          <Button
            aria-label="Close"
            appearance="transparent"
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden />
          </Button>
        </FlexLayout>
        <Text>Left panel content.</Text>
      </StackLayout>
    </SidePanel>
  );
};

export const ManualTrigger = () => (
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
      <LeftPanel />
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "var(--salt-spacing-200)",
        }}
      >
        <SidePanelTrigger>
          <Button style={{ whiteSpace: "nowrap" }}>Toggle left panel</Button>
        </SidePanelTrigger>
      </div>
    </SidePanelProvider>

    <SidePanelProvider>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "var(--salt-spacing-200)",
        }}
      >
        <SidePanelTrigger>
          <Button style={{ whiteSpace: "nowrap" }}>Toggle right panel</Button>
        </SidePanelTrigger>
      </div>
      <RightPanel />
    </SidePanelProvider>
  </div>
);
