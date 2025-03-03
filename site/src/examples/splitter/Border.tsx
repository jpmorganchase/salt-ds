import { FlexLayout, Text } from "@salt-ds/core";
import { SplitHandle, SplitPanel, Splitter } from "@salt-ds/lab";

import styles from "./splitter.module.css";

export function Border() {
  return (
    <FlexLayout className={styles.box}>
      <Splitter orientation="vertical">
        <SplitPanel minSize={0} defaultSize={25} className={styles.center}>
          <Text>Left</Text>
        </SplitPanel>
        <SplitHandle border="right" />
        <SplitPanel minSize={50} className={styles.center}>
          <Text>Center</Text>
        </SplitPanel>
        <SplitHandle border="left" />
        <SplitPanel minSize={0} defaultSize={25} className={styles.center}>
          <Text>Right</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}
