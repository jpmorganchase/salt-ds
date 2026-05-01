import { Button, FlexLayout, Text, useIcon, useId } from "@salt-ds/core";
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelProvider,
  SidePanelTitle,
  type SidePanelValue,
  useSidePanel,
} from "@salt-ds/lab";
import { clsx } from "clsx";
import type { CSSProperties } from "react";
import { ContentExample } from "./ContentExample";

const panelStyle = {
  "--saltSidePanel-width": "200px",
} as CSSProperties;

const RightPanel = () => {
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanel();

  const titleId = useId();
  const closeButtonId = useId();

  return (
    <SidePanel style={panelStyle} variant="secondary">
      <SidePanelHeader>
        <SidePanelTitle id={titleId}>Right Panel</SidePanelTitle>
        <Button
          aria-label="Close"
          aria-labelledby={clsx(closeButtonId, titleId) || undefined}
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

  const titleId = useId();
  const closeButtonId = useId();

  return (
    <SidePanel position="left" style={panelStyle} variant="secondary">
      <SidePanelHeader>
        <SidePanelTitle id={titleId}>Left Panel</SidePanelTitle>
        <Button
          aria-label="Close"
          aria-labelledby={clsx(closeButtonId, titleId) || undefined}
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
  context: SidePanelValue;
}) => {
  const { openState, setOpen, panelId, getTriggerProps } = context;

  return (
    <Button
      {...getTriggerProps({
        "aria-expanded": openState,
        "aria-controls": openState ? panelId : undefined,
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
