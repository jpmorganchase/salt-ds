import {
  Button,
  FlexLayout,
  SidePanel,
  SidePanelCloseButton,
  SidePanelContent,
  SidePanelHeader,
  SidePanelProvider,
  SidePanelTitle,
  SidePanelTrigger,
  Text,
  useSidePanel,
} from "@salt-ds/core";
import type { CSSProperties } from "react";
import { ContentExample } from "./ContentExample";
import styles from "./index.module.css";

const panelStyle = {
  "--saltSidePanel-width": "200px",
} as CSSProperties;

const RightPanel = () => {
  return (
    <SidePanel style={panelStyle}>
      <SidePanelHeader>
        <SidePanelTitle>Right Panel</SidePanelTitle>
        <SidePanelCloseButton />
      </SidePanelHeader>
      <SidePanelContent>
        <Text>Right panel content.</Text>
      </SidePanelContent>
    </SidePanel>
  );
};

const LeftPanel = () => {
  return (
    <SidePanel position="left" style={panelStyle}>
      <SidePanelHeader>
        <SidePanelTitle>Left Panel</SidePanelTitle>
        <SidePanelCloseButton />
      </SidePanelHeader>
      <SidePanelContent>
        <Text>Left panel content.</Text>
      </SidePanelContent>
    </SidePanel>
  );
};

const ContentArea = () => {
  const { getTriggerProps } = useSidePanel();

  return (
    <SidePanelProvider>
      <ContentExample>
        <FlexLayout gap={1} justify="space-between">
          <Button {...getTriggerProps()} style={{ whiteSpace: "nowrap" }}>
            Toggle left panel
          </Button>
          <SidePanelTrigger>
            <Button style={{ whiteSpace: "nowrap" }}>Toggle right panel</Button>
          </SidePanelTrigger>
        </FlexLayout>
      </ContentExample>
      <RightPanel />
    </SidePanelProvider>
  );
};

export const ManualTrigger = () => {
  return (
    <SidePanelProvider>
      <div className={styles.appFrame}>
        <FlexLayout gap={0} style={{ height: "100%" }}>
          <LeftPanel />
          <ContentArea />
        </FlexLayout>
      </div>
    </SidePanelProvider>
  );
};
