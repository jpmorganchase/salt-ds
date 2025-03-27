import {
  FlexLayout,
  SplitHandle,
  SplitPanel,
  Splitter,
  Text,
} from "@salt-ds/core";

import styles from "./splitter.module.css";

export function Variant() {
  return (
    <FlexLayout className={styles.box}>
      <Splitter orientation="vertical">
        <SplitPanel variant="primary" className={styles.center}>
          <Text>Primary</Text>
        </SplitPanel>
        <SplitHandle variant="secondary" border="left" />
        <SplitPanel variant="secondary" className={styles.center}>
          <Text>Secondary</Text>
        </SplitPanel>
        <SplitHandle variant="tertiary" border="left" />
        <SplitPanel variant="tertiary" className={styles.center}>
          <Text>Tertiary</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}
