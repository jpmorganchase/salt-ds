import { FlexLayout, Text } from "@salt-ds/core";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import styles from "./splitter.module.css";

export function Horizontal() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className={styles.box}>
        <PanelGroup direction="horizontal">
          <Panel id="left" className={styles.center}>
            <Text>Left</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-border-right" />
          <Panel id="center" className={styles.center}>
            <Text>Center</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-border-leftt" />
          <Panel id="right" className={styles.center}>
            <Text>Right</Text>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </div>
  );
}
