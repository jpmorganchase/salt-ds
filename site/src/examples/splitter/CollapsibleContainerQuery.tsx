import {
  FlexLayout,
  SplitHandle,
  SplitPanel,
  Splitter,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { EditIcon, InboxIcon, SendIcon } from "@salt-ds/icons";

import styles from "./splitter.module.css";

export function CollapsibleContainerQuery() {
  return (
    <FlexLayout className={styles.box}>
      <Splitter orientation="vertical" appearance="bordered">
        <SplitPanel
          collapsible
          collapsedSize={10}
          defaultSize={30}
          minSize={20}
          maxSize={50}
          className={styles.sidePanel}
        >
          <ToggleButtonGroup
            orientation="vertical"
            defaultValue="inbox"
            className={styles.sidePanelButtonGroup}
          >
            <ToggleButton value="inbox">
              <InboxIcon aria-label="Inbox" />
              <span aria-hidden>Inbox</span>
            </ToggleButton>
            <ToggleButton value="draft">
              <EditIcon aria-label="Draft" />
              <span aria-hidden>Draft</span>
            </ToggleButton>
            <ToggleButton value="sent">
              <SendIcon aria-label="Sent" />
              <span aria-hidden>Sent</span>
            </ToggleButton>
          </ToggleButtonGroup>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel className={styles.center}>
          <Text>Content</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}
