import { FlexLayout, Text } from "@salt-ds/core";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import styles from "./splitter.module.css";

export function Vertical() {
  return (
    <FlexLayout className={styles.box}>
      <PanelGroup direction="vertical">
        <Panel id="top" className={styles.center}>
          <Text>Top</Text>
        </Panel>
        <PanelResizeHandle className="resize-handle-border-top" />
        <Panel id="center" className={styles.center}>
          <Text>Center</Text>
        </Panel>
        <PanelResizeHandle className="resize-handle-border-bottom" />
        <Panel id="bottom" className={styles.center}>
          <Text>Bottom</Text>
        </Panel>
      </PanelGroup>
    </FlexLayout>
  );
}
