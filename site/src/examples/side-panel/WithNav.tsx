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
import styles from "./index.module.css";

const Nav = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "var(--salt-spacing-100)",
      padding: "var(--salt-spacing-200)",
      borderRight:
        "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
      backgroundColor: "var(--salt-container-primary-background)",
      whiteSpace: "nowrap",
    }}
  >
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
        key={i}
        style={{
          height: "var(--salt-size-base)",
          aspectRatio: 1,
          border:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
          borderRadius: "var(--salt-palette-corner-weak)",
        }}
      />
    ))}
  </div>
);

export const WithNav = () => {
  return (
    <SidePanelProvider>
      <div className={styles.appFrame}>
        <FlexLayout gap={0} style={{ height: "100%" }}>
          <Nav />
          <SidePanel position="left">
            <SidePanelHeader>
              <SidePanelTitle>Section Title</SidePanelTitle>
              <SidePanelCloseButton />
            </SidePanelHeader>
            <SidePanelContent>
              <Text>Side panel content goes here.</Text>
            </SidePanelContent>
          </SidePanel>
          <ContentExample>
            <SidePanelTrigger>
              <Button>Open side panel</Button>
            </SidePanelTrigger>
          </ContentExample>
        </FlexLayout>
      </div>
    </SidePanelProvider>
  );
};
