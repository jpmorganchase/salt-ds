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
        <SplitPanel
          variant="primary"
          minSize={0}
          defaultSize={25}
          className={styles.center}
        >
          <Text>Primary</Text>
        </SplitPanel>
        <SplitHandle border="right" variant="primary" />
        <SplitPanel variant="secondary" minSize={50} className={styles.center}>
          <Text>Secondary</Text>
        </SplitPanel>
        <SplitHandle border="left" variant="tertiary" />
        <SplitPanel
          variant="tertiary"
          minSize={0}
          defaultSize={25}
          className={styles.center}
        >
          <Text>Tertiary</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}
