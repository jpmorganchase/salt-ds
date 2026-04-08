import { Button, FlexLayout, H2, Text, useId } from "@salt-ds/core";
import {
  SidePanel,
  SidePanelContent,
  SidePanelProvider,
  SidePanelTrigger,
  useSidePanelContext,
} from "@salt-ds/lab";
import { ContentExample } from "./ContentExample";

const SidePanelExample = () => {
  const headingId = useId();
  const { openState } = useSidePanelContext();

  return (
    <>
      <SidePanel position="left" aria-labelledby={headingId}>
        <SidePanelContent header={<H2 id={headingId}>Section Title</H2>}>
          <Text>Side panel content goes here.</Text>
        </SidePanelContent>
      </SidePanel>

      <ContentExample>
        <SidePanelTrigger>
          <Button style={{ width: "fit-content" }}>
            {openState ? "Close" : "Open"} left panel
          </Button>
        </SidePanelTrigger>
      </ContentExample>
    </>
  );
};

export const LeftPanel = () => (
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
