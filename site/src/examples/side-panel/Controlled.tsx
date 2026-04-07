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

const SidePanelExample = () => {
  const { openState, setOpen } = useSidePanelContext();
  const headingId = useId();
  const { CloseIcon } = useIcon();
  return (
    <>
      <SidePanel position="left" aria-labelledby={headingId}>
        <StackLayout>
          <FlexLayout align="center">
            <H2 id={headingId} style={{ flex: 1 }}>
              Section Title
            </H2>
            <Button
              aria-label="Close"
              appearance="transparent"
              onClick={() => setOpen(false)}
            >
              <CloseIcon aria-hidden />
            </Button>
          </FlexLayout>
          <Text>Side panel content goes here.</Text>
        </StackLayout>
      </SidePanel>

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "flex-end",
          padding: "var(--salt-spacing-300)",
        }}
      >
        <SidePanelTrigger>
          <Button>{openState ? "Close" : "Open"} side panel</Button>
        </SidePanelTrigger>
      </div>
    </>
  );
};

export const Controlled = () => (
  <SidePanelProvider>
    <FlexLayout
      style={{
        width: "100%",
        height: 300,
        border:
          "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
        borderRadius: "var(--salt-palette-corner-weak)",
      }}
      gap={0}
    >
      <SidePanelExample />
    </FlexLayout>
  </SidePanelProvider>
);
