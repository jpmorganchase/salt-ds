import { ReactElement } from "react";
import { FlexLayout, FlexItem } from "@salt-ds/core";
import styles from "./index.module.css";

export const Default = (): ReactElement => (
  <FlexLayout>
    {Array.from({ length: 6 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 1}
      </FlexItem>
    ))}
  </FlexLayout>
);
