import { FlexItem, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import flexItemStyles from "./FlexItemSize.module.css";
import styles from "./index.module.css";

export const FlexItemSize = (): ReactElement => (
  <StackLayout className={flexItemStyles.stackLayout}>
    <FlexItem grow={1} className={styles.flexItem}>
      1
    </FlexItem>
    {Array.from({ length: 3 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 2}
      </FlexItem>
    ))}
  </StackLayout>
);
