import {
  FlexLayout,
  SplitHandle,
  SplitPanel,
  Splitter,
  Text,
} from "@salt-ds/core";

import styles from "./splitter.module.css";

export function Collapsible() {
  return (
    <FlexLayout className={styles.box}>
      <Splitter orientation="vertical" appearance="bordered">
        <SplitPanel
          collapsible
          collapsedSize={10}
          minSize={30}
          maxSize={30}
          className={styles.center}
        >
          <Text>
            Left <br />
            {"{10%, 30%}"}
          </Text>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel className={styles.center}>
          <Text>Right</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}
