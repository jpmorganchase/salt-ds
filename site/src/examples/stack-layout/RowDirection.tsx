import { ReactElement } from "react";
import { StackLayout, FlexItem } from "@salt-ds/core";
import styles from "./index.module.css";

export const RowDirection = (): ReactElement => (
  <StackLayout direction="row">
    {Array.from({ length: 4 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 1}
      </FlexItem>
    ))}
  </StackLayout>
);
