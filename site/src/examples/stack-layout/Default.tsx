import { ReactElement } from "react";
import { StackLayout, FlexItem } from "@salt-ds/core";
import styles from "./index.module.css";

export const Default = (): ReactElement => (
  <StackLayout>
    {Array.from({ length: 4 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 1}
      </FlexItem>
    ))}
  </StackLayout>
);
