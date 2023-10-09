import { ReactElement } from "react";
import { SplitLayout, FlexItem, StackLayout } from "@salt-ds/core";
import styles from "./index.module.css";
import columnDirectionStyles from "./ColumnDirection.module.css";

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
