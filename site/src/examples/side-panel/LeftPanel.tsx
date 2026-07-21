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
} from "@salt-ds/core";
import { ContentExample } from "./ContentExample";
import styles from "./index.module.css";

export const LeftPanel = () => {
  return (
    <SidePanelProvider>
      <div className={styles.appFrame}>
        <FlexLayout gap={0} style={{ height: "100%" }}>
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
              <Button>Toggle left panel</Button>
            </SidePanelTrigger>
          </ContentExample>
        </FlexLayout>
      </div>
    </SidePanelProvider>
  );
};
