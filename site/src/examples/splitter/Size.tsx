import { FlexLayout, Text } from "@salt-ds/core";
import { SplitHandle, SplitPanel, Splitter } from "@salt-ds/lab";

import styles from "./splitter.module.css";

export function Size() {
  return (
    <FlexLayout className={styles.box}>
      <Splitter orientation="vertical" appearance="bordered">
        <SplitPanel minSize={20} className={styles.center}>
          <Text>Left [20%, X]</Text>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel minSize={40} maxSize={60} className={styles.center}>
          <Text>Middle [30%, 60%]</Text>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel minSize={20} className={styles.center}>
          <Text>Right [20%, X]</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}
