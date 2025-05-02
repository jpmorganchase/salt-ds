import { FlexLayout, Text } from "@salt-ds/core";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import styles from "./splitter.module.css";

export function Horizontal() {
  return (
    <FlexLayout className={styles.box}>
      <PanelGroup direction="horizontal">
        <Panel id="top" className={styles.center}>
          <Text>Top</Text>
        </Panel>
        <PanelResizeHandle className="resize-handle-border-left resize-handle-border-right" />
        <Panel id="middle" className={styles.center}>
          <Text>Middle</Text>
        </Panel>
        <PanelResizeHandle className="resize-handle-border-left resize-handle-border-right" />
        <Panel id="bottom" className={styles.center}>
          <Text>Bottom</Text>
        </Panel>
      </PanelGroup>
    </FlexLayout>
  );
}
