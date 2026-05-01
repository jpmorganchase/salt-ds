import {
  Button,
  FlexLayout,
  StackLayout,
  Text,
  useIcon,
  useId,
} from "@salt-ds/core";
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelProvider,
  SidePanelTitle,
  SidePanelTrigger,
  useSidePanel,
} from "@salt-ds/lab";
import { clsx } from "clsx";

const ScrollableContent = () => (
  <div
    role="region"
    aria-label="Main content"
    tabIndex={0}
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "var(--salt-spacing-200)",
      padding: "var(--salt-spacing-300)",
      overscrollBehavior: "contain",
      overflow: "auto",
    }}
  >
    <SidePanelTrigger>
      <Button style={{ width: "fit-content", flexShrink: 0 }}>
        Open right panel
      </Button>
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
          // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
          key={`content-${i}`}
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

const ScrollablePanel = () => {
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanel();

  const titleId = useId();
  const closeButtonId = useId();

  return (
    <SidePanel position="right">
      <SidePanelHeader>
        <SidePanelTitle id={titleId}>Section Title</SidePanelTitle>
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
        <StackLayout>
          {Array.from({ length: 10 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static list of identical placeholder items
            <Text key={`panel-item-${i}`}>
              Panel item — This is scrollable content inside the side panel that
              demonstrates independent scrolling.
            </Text>
          ))}
        </StackLayout>
      </SidePanelContent>
    </SidePanel>
  );
};

export const Scrollable = () => {
  return (
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
        <ScrollableContent />
        <ScrollablePanel />
      </FlexLayout>
    </SidePanelProvider>
  );
};
