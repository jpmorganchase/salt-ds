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
