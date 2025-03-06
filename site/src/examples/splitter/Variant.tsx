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
          variant="secondary"
          minSize={0}
          defaultSize={25}
          className={styles.center}
        >
          <Text>Left</Text>
        </SplitPanel>
        <SplitHandle border="right" variant="secondary" />
        <SplitPanel minSize={50} className={styles.center}>
          <Text>Center</Text>
        </SplitPanel>
        <SplitHandle border="left" variant="secondary" />
        <SplitPanel
          variant="secondary"
          minSize={0}
          defaultSize={25}
          className={styles.center}
        >
          <Text>Right</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}
