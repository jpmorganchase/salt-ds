import { FlexItem, FlexLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const ColumnDirection = (): ReactElement => (
  <FlexLayout direction="column">
    {Array.from({ length: 6 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 1}
      </FlexItem>
    ))}
  </FlexLayout>
);
