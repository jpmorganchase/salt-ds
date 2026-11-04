import { FlexLayout, Text } from "@salt-ds/core";
import { Group, Panel, Separator } from "react-resizable-panels";

import styles from "./splitter.module.css";

export function Horizontal() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className={styles.box}>
        <Group orientation="horizontal">
          <Panel className={styles.center}>
            <Text>Left</Text>
          </Panel>
          <Separator className="resize-handle-salt-border-right" />
          <Panel className={styles.center}>
            <Text>Center</Text>
          </Panel>
          <Separator className="resize-handle-salt-border-left" />
          <Panel className={styles.center}>
            <Text>Right</Text>
          </Panel>
        </Group>
      </FlexLayout>
    </div>
  );
}
