import { Button, FlexLayout, H2, Text, useId } from "@salt-ds/core";
import {
  SidePanel,
  SidePanelContent,
  SidePanelProvider,
  SidePanelTrigger,
  useSidePanelContext,
} from "@salt-ds/lab";
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
  const headingId = useId();
  const { openState } = useSidePanelContext();

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
      <SidePanel position="left" aria-labelledby={headingId}>
        <SidePanelContent header={<H2 id={headingId}>Section Title</H2>}>
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
