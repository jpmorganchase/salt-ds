import { Button, FlexLayout, Text } from "@salt-ds/core";
import {
  SidePanel,
  SidePanelCloseButton,
  SidePanelContent,
  SidePanelHeader,
  SidePanelProvider,
  SidePanelTitle,
  SidePanelTrigger,
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
          <Button style={{ width: "fit-content" }}>Open right panel</Button>
        </SidePanelTrigger>
      </ContentExample>

      <SidePanel position="right">
        <SidePanelHeader>
          <SidePanelTitle>Section Title</SidePanelTitle>
          <SidePanelCloseButton />
        </SidePanelHeader>
        <SidePanelContent>
          <Text>Side panel content goes here.</Text>
        </SidePanelContent>
      </SidePanel>
    </FlexLayout>
  );
};
