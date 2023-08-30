import { ReactElement } from "react";
import { FlowLayout, FlexItem } from "@salt-ds/core";
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
