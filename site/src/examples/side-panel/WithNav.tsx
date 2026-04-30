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

const Nav = () => (
  <nav
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "var(--salt-spacing-100)",
      padding: "var(--salt-spacing-200)",
      borderRight:
        "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
      backgroundColor: "var(--salt-container-secondary-background)",
      whiteSpace: "nowrap",
    }}
  >
    <Text styleAs="label" style={{ fontWeight: "bold" }}>
      Nav
    </Text>
    <Text>Item 1</Text>
    <Text>Item 2</Text>
    <Text>Item 3</Text>
  </nav>
);

export const WithNav = () => {
  return (
    <SidePanelProvider>
      <WithNavContent />
    </SidePanelProvider>
  );
};

const WithNavContent = () => {
  const { CloseIcon } = useIcon();
  const { openState, setOpen } = useSidePanel();

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
      <Nav />
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
          <Button style={{ width: "fit-content" }}>
            {openState ? "Close" : "Open"} side panel
          </Button>
        </SidePanelTrigger>
      </ContentExample>
    </FlexLayout>
  );
};
