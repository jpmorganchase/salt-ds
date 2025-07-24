import { FlexItem, SplitLayout, StackLayout } from "@salt-ds/core";
import { clsx } from "clsx";
import type { ReactElement } from "react";
import flexItemSizeStyles from "./FlexItemSize.module.css";
import styles from "./index.module.css";

const startItem = (
  <StackLayout direction="row" className={flexItemSizeStyles.stackLayout}>
    <FlexItem
      grow={1}
      className={clsx(styles.flexItem, flexItemSizeStyles.active)}
    >
      1
    </FlexItem>
    {Array.from({ length: 2 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 2}
      </FlexItem>
    ))}
  </StackLayout>
);
const endItem = (
  <StackLayout direction="row">
    {Array.from({ length: 2 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 4}
      </FlexItem>
    ))}
  </StackLayout>
);

export const FlexItemSize = (): ReactElement => (
  <SplitLayout
    startItem={startItem}
    endItem={endItem}
    className={styles.splitLayout}
  />
);
