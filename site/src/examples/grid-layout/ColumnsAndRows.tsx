import { ReactElement } from "react";
import { GridLayout, GridItem } from "@salt-ds/core";
import styles from "./index.module.css";

export const ColumnsAndRows = (): ReactElement => (
  <GridLayout columns={6} rows={3}>
    {Array.from({ length: 18 }, (_, index) => (
      <GridItem key={index} className={styles.gridItem}>
        <p>{index + 1}</p>
      </GridItem>
    ))}
  </GridLayout>
);
