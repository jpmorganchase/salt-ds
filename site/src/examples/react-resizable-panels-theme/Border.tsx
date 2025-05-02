import { FlexLayout, Text } from "@salt-ds/core";
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";

import styles from "./splitter.module.css";

export function Border() {
  return (
    <FlexLayout className={styles.box}>
      <PanelGroup direction="horizontal">
        <Panel minSize={0} defaultSize={25} className={styles.center}>
          <Text>Left</Text>
        </Panel>
        <PanelResizeHandle className="resize-handle-border-right" />
        <Panel minSize={50} className={styles.center}>
          <Text>Center</Text>
        </Panel>
        <PanelResizeHandle className="resize-handle-border-left" />
        <Panel minSize={0} defaultSize={25} className={styles.center}>
          <Text>Right</Text>
        </Panel>
      </PanelGroup>
    </FlexLayout>
  );
}
