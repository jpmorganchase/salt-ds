import { Button, FlexLayout, Text, useIcon } from "@salt-ds/core";
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelProvider,
  SidePanelTitle,
  useSidePanel,
} from "@salt-ds/lab";
import type { CSSProperties } from "react";
import { ContentExample } from "./ContentExample";

const panelStyle = {
  "--saltSidePanel-width": "200px",
} as CSSProperties;

type PanelContext = ReturnType<typeof useSidePanel>;

const RightPanel = () => {
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanel();

  return (
    <SidePanel style={panelStyle} variant="secondary">
      <SidePanelHeader>
        <SidePanelTitle>Right Panel</SidePanelTitle>
        <Button
          aria-label="Close"
          appearance="transparent"
          onClick={() => setOpen(false)}
        >
          <CloseIcon aria-hidden />
        </Button>
      </SidePanelHeader>
      <SidePanelContent>
        <Text>Right panel content.</Text>
      </SidePanelContent>
    </SidePanel>
  );
};

const LeftPanel = () => {
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanel();

  return (
    <SidePanel position="left" style={panelStyle} variant="secondary">
      <SidePanelHeader>
        <SidePanelTitle>Left Panel</SidePanelTitle>
        <Button
          aria-label="Close"
          appearance="transparent"
          onClick={() => setOpen(false)}
        >
          <CloseIcon aria-hidden />
        </Button>
      </SidePanelHeader>
      <SidePanelContent>
        <Text>Left panel content.</Text>
      </SidePanelContent>
    </SidePanel>
  );
};

const TriggerButton = ({
  children,
  context,
}: {
  children: string;
  context: PanelContext;
}) => {
  const { openState, setOpen, getTriggerProps } = context;

  return (
    <Button
      {...getTriggerProps({
        onClick: () => setOpen(!openState),
      })}
      style={{ width: "fit-content", whiteSpace: "nowrap" }}
    >
      {children}
    </Button>
  );
};

const RightPanelTriggerButton = () => {
  const rightPanelContext = useSidePanel();

  return (
    <TriggerButton context={rightPanelContext}>
      Toggle right panel
    </TriggerButton>
  );
};

const ContentArea = () => {
  const leftPanelContext = useSidePanel();

  return (
    <SidePanelProvider>
      <ContentExample>
        <FlexLayout gap={1} justify="space-between">
          <TriggerButton context={leftPanelContext}>
            Toggle left panel
          </TriggerButton>
          <RightPanelTriggerButton />
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
