import {
  FlexLayout,
  SplitHandle,
  SplitPanel,
  Splitter,
  Text,
} from "@salt-ds/core";

import clsx from "clsx";

import styles from "./splitter.module.css";

export function Transparent() {
  return (
    <FlexLayout className={clsx(styles.box, styles.boxSecondary)}>
      <Splitter orientation="horizontal" appearance="transparent">
        <SplitPanel>
          <Splitter orientation="vertical">
            <SplitPanel className={styles.center}>
              <Text>Top Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className={styles.center}>
              <Text>Center Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className={styles.center}>
              <Text>Bottom Left</Text>
            </SplitPanel>
          </Splitter>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel>
          <Splitter orientation="vertical">
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
