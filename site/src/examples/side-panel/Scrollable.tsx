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

const ScrollableContent = () => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "var(--salt-spacing-200)",
      padding: "var(--salt-spacing-300)",
      overflow: "auto",
    }}
  >
    <SidePanelTrigger>
      <Button style={{ width: "fit-content" }}>Toggle right panel</Button>
    </SidePanelTrigger>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "var(--salt-spacing-200)",
      }}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={`grid-item-${i}`}
          style={{
            backgroundColor: "var(--salt-container-secondary-background)",
            borderRadius: "var(--salt-palette-corner-weak)",
            border:
              "var(--salt-size-fixed-100) dashed var(--salt-container-primary-borderColor)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 80,
          }}
        />
      ))}
    </div>
  </div>
);

const SidePanelExample = () => {
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();

  return (
    <>
      <ScrollableContent />
      <SidePanel position="right" aria-labelledby={headingId}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <FlexLayout
            align="center"
            style={{
              flexShrink: 0,
            }}
          >
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
          <div
            style={{
              flex: 1,
              overflow: "auto",
            }}
          >
            <StackLayout>
              {Array.from({ length: 10 }, (_, i) => (
                <Text key={`panel-item-${i}`}>
                  Panel item — This is scrollable content inside the
                  side panel that demonstrates independent scrolling.
                </Text>
              ))}
            </StackLayout>
          </div>
        </div>
      </SidePanel>
    </>
  );
};

export const Scrollable = () => (
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







