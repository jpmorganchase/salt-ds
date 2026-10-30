import { FlexLayout, Text } from "@salt-ds/core";
import { Group, Panel, Separator } from "react-resizable-panels";

import styles from "./splitter.module.css";

export function Vertical() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className={styles.box}>
        <Group orientation="vertical">
          <Panel className={styles.center}>
            <Text>Top</Text>
          </Panel>
          <Separator className="resize-handle-salt-border-top" />
          <Panel className={styles.center}>
            <Text>Center</Text>
          </Panel>
          <Separator className="resize-handle-salt-border-bottom" />
          <Panel className={styles.center}>
            <Text>Bottom</Text>
          </Panel>
        </Group>
      </FlexLayout>
    </div>
  );
}
