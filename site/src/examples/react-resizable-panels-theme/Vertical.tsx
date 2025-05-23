import { FlexLayout, Text } from "@salt-ds/core";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import styles from "./splitter.module.css";

export function Vertical() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className={styles.box}>
        <PanelGroup direction="vertical">
          <Panel className={styles.center}>
            <Text>Top</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-salt-border-top" />
          <Panel className={styles.center}>
            <Text>Center</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-salt-border-bottom" />
          <Panel className={styles.center}>
            <Text>Bottom</Text>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </div>
  );
}
