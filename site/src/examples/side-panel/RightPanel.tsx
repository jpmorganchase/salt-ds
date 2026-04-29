import { Button, FlexLayout, H2, Text, useIcon } from "@salt-ds/core";
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelProvider,
  SidePanelTitle,
  SidePanelTrigger,
  useSidePanelContext,
} from "@salt-ds/lab";
import { ContentExample } from "./ContentExample";

export const RightPanel = () => {
  return (
    <SidePanelProvider>
      <RightPanelContent />
    </SidePanelProvider>
  );
};

const RightPanelContent = () => {
  const { CloseIcon } = useIcon();
  const { openState, setOpen } = useSidePanelContext();

  return (
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
      <ContentExample>
        <SidePanelTrigger>
          <Button style={{ width: "fit-content" }}>
            {openState ? "Close" : "Open"} right panel
          </Button>
        </SidePanelTrigger>
      </ContentExample>

      <SidePanel position="right">
        <SidePanelHeader>
          <SidePanelTitle>
            <H2>Section Title</H2>
          </SidePanelTitle>
          <Button
            aria-label="Close"
            appearance="transparent"
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden />
          </Button>
        </SidePanelHeader>
        <SidePanelContent>
          <Text>Side panel content goes here.</Text>
        </SidePanelContent>
      </SidePanel>
    </FlexLayout>
  );
};
