import { FlexLayout, Text } from "@salt-ds/core";
import { SplitHandle, SplitPanel, Splitter } from "@salt-ds/lab";

import styles from "./splitter.module.css";

export function Horizontal() {
  return (
    <FlexLayout className={styles.box}>
      <Splitter orientation="horizontal">
        <SplitPanel id="top" className={styles.center}>
          <Text>Top</Text>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel id="middle" className={styles.center}>
          <Text>Middle</Text>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel id="bottom" className={styles.center}>
          <Text>Bottom</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}
