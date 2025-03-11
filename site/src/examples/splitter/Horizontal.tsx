import {
  FlexLayout,
  SplitHandle,
  SplitPanel,
  Splitter,
  Text,
} from "@salt-ds/core";

import styles from "./splitter.module.css";

export function Horizontal() {
  return (
    <FlexLayout className={styles.box}>
      <Splitter orientation="horizontal">
        <SplitPanel id="top" className={styles.center}>
          <Text>Top</Text>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel id="center" className={styles.center}>
          <Text>Center</Text>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel id="bottom" className={styles.center}>
          <Text>Bottom</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}
