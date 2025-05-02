import { FlexLayout, Text } from "@salt-ds/core";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import styles from "./splitter.module.css";

export function Vertical() {
  return (
    <FlexLayout className={styles.box}>
      <PanelGroup direction="vertical">
        <Panel id="left" className={styles.center}>
          <Text>Left</Text>
        </Panel>
        <PanelResizeHandle className="resize-handle-border-top resize-handle-border-bottom"/>
        <Panel id="center" className={styles.center}>
          <Text>Center</Text>
        </Panel>
        <PanelResizeHandle className="resize-handle-border-top resize-handle-border-bottom"/>
        <Panel id="right" className={styles.center}>
          <Text>Right</Text>
        </Panel>
      </PanelGroup>
    </FlexLayout>
  );
}
