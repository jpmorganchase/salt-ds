import { FlexItem, FlowLayout, SplitLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

const startItem = (
  <FlowLayout>
    {Array.from({ length: 3 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 1}
      </FlexItem>
    ))}
  </FlowLayout>
);
const endItem = (
  <FlowLayout>
    {Array.from({ length: 2 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 4}
      </FlexItem>
    ))}
  </FlowLayout>
);

export const Default = (): ReactElement => (
  <SplitLayout
    startItem={startItem}
    endItem={endItem}
    className={styles.splitLayout}
  />
);
