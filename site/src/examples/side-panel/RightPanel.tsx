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

export const RightPanel = () => {
  return (
    <SidePanelProvider>
      <div className={styles.appFrame}>
        <FlexLayout gap={0} style={{ height: "100%" }}>
          <ContentExample>
            <SidePanelTrigger>
              <Button>Toggle right panel</Button>
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
      </div>
    </SidePanelProvider>
  );
};
