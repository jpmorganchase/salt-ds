import { FlexLayout, Text } from "@salt-ds/core";
import { SplitHandle, SplitPanel, Splitter } from "@salt-ds/lab";

import styles from "./splitter.module.css";

export function Vertical() {
  return (
    <FlexLayout className={styles.box}>
      <Splitter orientation="vertical">
        <SplitPanel id="left" className={styles.center}>
          <Text>Left</Text>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel id="center" className={styles.center}>
          <Text>Center</Text>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel id="right" className={styles.center}>
          <Text>Right</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}
