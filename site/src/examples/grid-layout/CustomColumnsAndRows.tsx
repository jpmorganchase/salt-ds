import { GridItem, GridLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const CustomColumnsAndRows = (): ReactElement => (
  <GridLayout columns="1fr 1fr 2fr" rows={3}>
    {Array.from({ length: 9 }, (_, index) => (
      <GridItem key={index} className={styles.gridItem}>
        <Text>{index + 1}</Text>
      </GridItem>
    ))}
  </GridLayout>
);
