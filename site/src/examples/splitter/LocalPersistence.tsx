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
          <Text>1. Resize the panel</Text>
        </SplitPanel>
        <SplitHandle aria-label="Resize Left/Right" />
        <SplitPanel id="right" className={styles.center}>
          <Text>2. Refresh the page</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}
