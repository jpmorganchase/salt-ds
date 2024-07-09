import { FlexItem, FlowLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Default = (): ReactElement => (
  <FlowLayout className={styles.flowLayout}>
    {Array.from({ length: 8 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 1}
      </FlexItem>
    ))}
  </FlowLayout>
);
