import { FlexItem, SplitLayout, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import columnDirectionStyles from "./ColumnDirection.module.css";
import styles from "./index.module.css";

const startItem = (
  <StackLayout>
    {Array.from({ length: 3 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 1}
      </FlexItem>
    ))}
  </StackLayout>
);
const endItem = (
  <StackLayout>
    {Array.from({ length: 2 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 4}
      </FlexItem>
    ))}
  </StackLayout>
);

export const ColumnDirection = (): ReactElement => (
  <SplitLayout
    startItem={startItem}
    endItem={endItem}
    direction="column"
    align="center"
    className={columnDirectionStyles.splitLayout}
  />
);
