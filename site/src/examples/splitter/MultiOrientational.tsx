import { FlexLayout, Text } from "@salt-ds/core";
import { SplitHandle, SplitPanel, Splitter } from "@salt-ds/lab";

import styles from "./splitter.module.css";

export function MultiOrientational() {
  return (
    <FlexLayout className={styles.box}>
      <Splitter orientation="vertical">
        <SplitPanel>
          <Splitter orientation="horizontal">
            <SplitPanel className={styles.center}>
              <Text>Top Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className={styles.center}>
              <Text>Middle Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className={styles.center}>
              <Text>Bottom Left</Text>
            </SplitPanel>
          </Splitter>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel>
          <Splitter orientation="horizontal">
            <SplitPanel className={styles.center}>
              <Text>Top Right</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className={styles.center}>
              <Text>Bottom Right</Text>
            </SplitPanel>
          </Splitter>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}
