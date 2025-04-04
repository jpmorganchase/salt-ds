import {
  FlexLayout,
  SplitHandle,
  SplitPanel,
  Splitter,
  Text,
} from "@salt-ds/core";

import styles from "./splitter.module.css";

export function LocalPersistence() {
  return (
    <FlexLayout className={styles.box}>
      <Splitter orientation="vertical" autoSaveId="splitter-persistence">
        <SplitPanel id="left" className={styles.center}>
          <Text>Left</Text>
        </SplitPanel>
        <SplitHandle aria-label="Resize Left/Right" />
        <SplitPanel id="right" className={styles.center}>
          <Text>Right</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}
