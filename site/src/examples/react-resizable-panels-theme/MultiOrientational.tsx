import { FlexLayout, Text } from "@salt-ds/core";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import styles from "./splitter.module.css";

export function MultiOrientational() {
  return (
    <FlexLayout className={styles.box}>
      <PanelGroup direction="horizontal">
        <Panel>
          <PanelGroup direction="vertical">
            <Panel className={styles.center}>
              <Text>Top Left</Text>
            </Panel>
            <PanelResizeHandle className="resize-handle-border-top resize-handle-border-bottom" />
            <Panel className={styles.center}>
              <Text>Middle Left</Text>
            </Panel>
            <PanelResizeHandle className="resize-handle-border-top resize-handle-border-bottom" />
            <Panel className={styles.center}>
              <Text>Bottom Left</Text>
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="resize-handle-border-right resize-handle-border-left" />
        <Panel>
          <PanelGroup direction="vertical">
            <Panel className={styles.center}>
              <Text>Top Right</Text>
            </Panel>
            <PanelResizeHandle className="resize-handle-border-top resize-handle-border-bottom" />
            <Panel className={styles.center}>
              <Text>Bottom Right</Text>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </FlexLayout>
  );
}
