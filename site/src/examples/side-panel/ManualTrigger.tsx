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
  useSidePanelContext,
} from "@salt-ds/lab";
import type { CSSProperties } from "react";
import { ContentExample } from "./ContentExample";

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
  const { CloseIcon } = useIcon();
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

const ManualTriggerButton = ({
  children,
}: {
  children: string;
}) => {
  const { openState, setOpen, getReferenceProps, setReference, panelId } =
    useSidePanelContext();

  return (
    <Button
      {...(getReferenceProps({
        "aria-controls": panelId,
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
              "aria-controls": leftCtx.panelId,
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
