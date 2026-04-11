import { Button, FlexLayout, H2, Text, useId } from "@salt-ds/core";
import {
  SidePanel,
  SidePanelContent,
  SidePanelProvider,
  useSidePanelContext,
} from "@salt-ds/lab";
import type { CSSProperties } from "react";
import { ContentExample } from "./ContentExample";

const panelStyle = {
  "--saltSidePanel-width": "200px",
} as CSSProperties;

const RightPanel = () => {
  const headingId = useId();
  return (
    <SidePanel
      aria-labelledby={headingId}
      style={panelStyle}
      variant="secondary"
    >
      <SidePanelContent header={<H2 id={headingId}>Right Panel</H2>}>
        <Text>Right panel content.</Text>
      </SidePanelContent>
    </SidePanel>
  );
};

const LeftPanel = () => {
  const headingId = useId();
  return (
    <SidePanel
      position="left"
      aria-labelledby={headingId}
      style={panelStyle}
      variant="secondary"
    >
      <SidePanelContent header={<H2 id={headingId}>Left Panel</H2>}>
        <Text>Left panel content.</Text>
      </SidePanelContent>
    </SidePanel>
  );
};

const ManualTriggerButton = ({ children }: { children: string }) => {
  const {
    openState,
    setOpen,
    getFloatingProps,
    getReferenceProps,
    setReference,
  } = useSidePanelContext();

  return (
    <Button
      {...(getReferenceProps({
        "aria-controls": getFloatingProps().id as string,
        onClick: () => setOpen(!openState),
      }) as Record<string, unknown>)}
      ref={setReference as React.Ref<HTMLButtonElement>}
      style={{ width: "fit-content", whiteSpace: "nowrap" }}
    >
      {children}
    </Button>
  );
};

const ContentArea = () => {
  const leftCtx = useSidePanelContext();

  return (
    <SidePanelProvider>
      <ContentExample>
        <FlexLayout gap={1} justify="space-between">
          <Button
            {...(leftCtx.getReferenceProps({
              "aria-controls": leftCtx.getFloatingProps().id as string,
              onClick: () => leftCtx.setOpen(!leftCtx.openState),
            }) as Record<string, unknown>)}
            ref={leftCtx.setReference as React.Ref<HTMLButtonElement>}
            style={{ width: "fit-content", whiteSpace: "nowrap" }}
          >
            Toggle left panel
          </Button>
          <ManualTriggerButton>Toggle right panel</ManualTriggerButton>
        </FlexLayout>
      </ContentExample>
      <RightPanel />
    </SidePanelProvider>
  );
};

export const ManualTrigger = () => {
  return (
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
        <ContentArea />
      </SidePanelProvider>
    </div>
  );
};
