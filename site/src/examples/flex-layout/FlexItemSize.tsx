import { FlexItem, FlexLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import flexItemSizeStyles from "./FlexItemSize.module.css";
import styles from "./index.module.css";

export const FlexItemSize = (): ReactElement => (
  <FlexLayout className={flexItemSizeStyles.flexLayout}>
    <FlexItem grow={1} className={styles.flexItem}>
      1
    </FlexItem>
    {Array.from({ length: 3 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 2}
      </FlexItem>
    ))}
  </FlexLayout>
);
