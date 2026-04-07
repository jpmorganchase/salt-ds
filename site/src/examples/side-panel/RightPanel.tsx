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
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const { openState, setOpen } = useSidePanelContext();
  return (
    <>
      <div style={{ flex: 1, padding: "var(--salt-spacing-300)" }}>
        <SidePanelTrigger>
          <Button>{openState ? "Close" : "Open"} right panel</Button>
        </SidePanelTrigger>
      </div>

      <SidePanel position="right" aria-labelledby={headingId}>
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
    </>
  );
};

export const RightPanel = () => (
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
