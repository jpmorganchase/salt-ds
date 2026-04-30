import { Button, FlexLayout, H2, Text, useIcon, useId } from "@salt-ds/core";
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
import { ContentExample } from "./ContentExample";

export const LeftPanel = () => {
  return (
    <SidePanelProvider>
      <LeftPanelContent />
    </SidePanelProvider>
  );
};

const LeftPanelContent = () => {
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanel();

  const headerId = useId();
  const closeButtonId = useId();

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
      <SidePanel position="left">
        <SidePanelHeader>
          <SidePanelTitle>
            <H2 id={headerId}>Section Title</H2>
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
          <Text>Side panel content goes here.</Text>
        </SidePanelContent>
      </SidePanel>

      <ContentExample>
        <SidePanelTrigger>
          <Button style={{ width: "fit-content" }}>Open left panel</Button>
        </SidePanelTrigger>
      </ContentExample>
    </FlexLayout>
  );
};
