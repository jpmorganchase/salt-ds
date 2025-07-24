import { FlexLayout, Text } from "@salt-ds/core";
import { clsx } from "clsx";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import styles from "./splitter.module.css";

export function Default() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className={clsx(styles.box, styles.boxGrey)}>
        <PanelGroup direction="horizontal">
          <Panel>
            <PanelGroup direction="vertical">
              <Panel
                className={clsx(
                  styles.center,
                  "resizable-panel-salt-variant-primary",
                )}
              >
                <Text>Top Left</Text>
              </Panel>
              <PanelResizeHandle className="" />
              <Panel
                className={clsx(
                  styles.center,
                  "resizable-panel-salt-variant-primary",
                )}
              >
                <Text>Middle Left</Text>
              </Panel>
              <PanelResizeHandle className="" />
              <Panel
                className={clsx(
                  styles.center,
                  "resizable-panel-salt-variant-primary",
                )}
              >
                <Text>Bottom Left</Text>
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle />
          <Panel>
            <PanelGroup direction="vertical">
              <Panel
                className={clsx(
                  styles.center,
                  "resizable-panel-salt-variant-primary",
                )}
              >
                <Text>Top Right</Text>
              </Panel>
              <PanelResizeHandle className="" />
              <Panel
                className={clsx(
                  styles.center,
                  "resizable-panel-salt-variant-primary",
                )}
              >
                <Text>Bottom Right</Text>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </div>
  );
}
