import { ReactElement } from "react";
import { FlowLayout, FlexItem } from "@salt-ds/core";
import clsx from "clsx";
import styles from "./index.module.css";
import flexItemSizeStyles from "./FlexItemSize.module.css";

export const FlexItemSize = (): ReactElement => (
  <FlowLayout
    className={clsx(styles.flowLayout, flexItemSizeStyles.flowLayout)}
  >
    <FlexItem grow={1} className={styles.flexItem}>
      1
    </FlexItem>
    {Array.from({ length: 6 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 2}
      </FlexItem>
    ))}
  </FlowLayout>
);
