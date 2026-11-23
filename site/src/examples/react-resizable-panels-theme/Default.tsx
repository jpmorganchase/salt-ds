import { FlexLayout, Text } from "@salt-ds/core";
import { clsx } from "clsx";
import { Group, Panel, Separator } from "react-resizable-panels";

import styles from "./splitter.module.css";

export function Default() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className={clsx(styles.box, styles.boxGrey)}>
        <Group orientation="horizontal">
          <Panel>
            <Group orientation="vertical">
              <Panel
                className={clsx(
                  styles.center,
                  "resizable-panel-salt-variant-primary",
                )}
              >
                <Text>Top Left</Text>
              </Panel>
              <Separator className="" />
              <Panel
                className={clsx(
                  styles.center,
                  "resizable-panel-salt-variant-primary",
                )}
              >
                <Text>Middle Left</Text>
              </Panel>
              <Separator className="" />
              <Panel
                className={clsx(
                  styles.center,
                  "resizable-panel-salt-variant-primary",
                )}
              >
                <Text>Bottom Left</Text>
              </Panel>
            </Group>
          </Panel>
          <Separator />
          <Panel>
            <Group orientation="vertical">
              <Panel
                className={clsx(
                  styles.center,
                  "resizable-panel-salt-variant-primary",
                )}
              >
                <Text>Top Right</Text>
              </Panel>
              <Separator className="" />
              <Panel
                className={clsx(
                  styles.center,
                  "resizable-panel-salt-variant-primary",
                )}
              >
                <Text>Bottom Right</Text>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </FlexLayout>
    </div>
  );
}
