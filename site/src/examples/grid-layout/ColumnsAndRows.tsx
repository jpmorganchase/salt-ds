import { GridItem, GridLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const ColumnsAndRows = (): ReactElement => (
  <GridLayout columns={6} rows={3}>
    {Array.from({ length: 18 }, (_, index) => (
      <GridItem key={index} className={styles.gridItem}>
        <Text>{index + 1}</Text>
      </GridItem>
    ))}
  </GridLayout>
);
