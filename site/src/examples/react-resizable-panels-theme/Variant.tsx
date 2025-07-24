import { FlexLayout, Text } from "@salt-ds/core";
import { clsx } from "clsx";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import styles from "./splitter.module.css";

export function Variant() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className={styles.box}>
        <PanelGroup direction="horizontal">
          <Panel
            minSize={0}
            defaultSize={25}
            className={clsx(
              styles.center,
              "resizable-panel-salt-variant-secondary",
            )}
          >
            <Text>Left</Text>
          </Panel>
          <PanelResizeHandle
            className={clsx(
              "resize-handle-salt-border-right",
              "resize-handle-salt-variant-secondary",
            )}
          />
          <Panel minSize={50} className={styles.center}>
            <Text>Center</Text>
          </Panel>
          <PanelResizeHandle
            className={clsx(
              "resize-handle-salt-border-left",
              "resize-handle-salt-variant-tertiary",
            )}
          />
          <Panel
            minSize={0}
            defaultSize={25}
            className={clsx(
              styles.center,
              "resizable-panel-salt-variant-tertiary",
            )}
          >
            <Text>Right</Text>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </div>
  );
}
