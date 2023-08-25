import { ReactElement } from "react";
import { FlexLayout, FlexItem } from "@salt-ds/core";
import styles from "./index.module.css";
import itemSizeStyles from "./ItemSize.module.css";

export const ItemSize = (): ReactElement => (
  <FlexLayout className={itemSizeStyles.flexLayout}>
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
