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

const SidePanelExample = () => {
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const { openState, setOpen } = useSidePanelContext();

  return (
    <>
      <Nav />
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
      <ContentExample>
        <SidePanelTrigger>
          <Button style={{ width: "fit-content" }}>
            {openState ? "Close" : "Open"} side panel
          </Button>
        </SidePanelTrigger>
      </ContentExample>
    </>
  );
};

export const WithNav = () => (
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

