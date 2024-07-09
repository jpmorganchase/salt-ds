import { FlexItem, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const LayoutSeparators = (): ReactElement => (
  <StackLayout separators>
    {Array.from({ length: 4 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 1}
      </FlexItem>
    ))}
  </StackLayout>
);
