import { Button, FlexLayout, H2, Text, useIcon, useId } from "@salt-ds/core";
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelProvider,
  SidePanelTitle,
  useSidePanelContext,
} from "@salt-ds/lab";
import clsx from "clsx";
import type { CSSProperties } from "react";
import { ContentExample } from "./ContentExample";

const panelStyle = {
  "--saltSidePanel-width": "200px",
} as CSSProperties;

type PanelContext = ReturnType<typeof useSidePanelContext>;

const RightPanel = () => {
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();

  const headerId = useId();
  const closeButtonId = useId();

  return (
    <SidePanel style={panelStyle} variant="secondary">
      <SidePanelHeader>
        <SidePanelTitle>
          <H2 id={headerId}>Right Panel</H2>
        </SidePanelTitle>
        <Button
          id={closeButtonId}
          aria-label="Close"
          aria-labelledby={clsx(closeButtonId, headerId) || undefined}
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
  const { setOpen } = useSidePanelContext();

  const headerId = useId();
  const closeButtonId = useId();

  return (
    <SidePanel position="left" style={panelStyle} variant="secondary">
      <SidePanelHeader>
        <SidePanelTitle>
          <H2 id={headerId}>Left Panel</H2>
        </SidePanelTitle>
        <Button
          id={closeButtonId}
          aria-label="Close"
          aria-labelledby={clsx(closeButtonId, headerId) || undefined}
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
  const { openState, setOpen, panelId, getReferenceProps, setReference } =
    context;

  return (
    <Button
      {...(getReferenceProps({
        "aria-expanded": openState,
        "aria-controls": openState ? panelId : undefined,
        onClick: () => setOpen(!openState),
      }) as Record<string, unknown>)}
      ref={setReference as React.Ref<HTMLButtonElement>}
      style={{ width: "fit-content", whiteSpace: "nowrap" }}
    >
      {children}
    </Button>
  );
};

const RightPanelTriggerButton = () => {
  const rightPanelContext = useSidePanelContext();

  return (
    <TriggerButton context={rightPanelContext}>
      Toggle right panel
    </TriggerButton>
  );
};

const ContentArea = () => {
  const leftPanelContext = useSidePanelContext();

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
