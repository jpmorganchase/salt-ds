import { ReactElement } from "react";
import { GridLayout, GridItem } from "@salt-ds/core";
import styles from "./index.module.css";

export const SpanningColumnsAndRows = (): ReactElement => (
  <GridLayout columns={4} rows={3}>
    {Array.from({ length: 7 }, (_, index) => {
      let colSpan = 1;
      let rowSpan = 1;

      if (index === 0) {
        colSpan = 2;
        rowSpan = 2;
      }

      if (index === 3 || index === 6) {
        colSpan = 2;
      }

      return (
        <GridItem
          key={index}
          colSpan={colSpan}
          rowSpan={rowSpan}
          className={styles.gridItem}
        >
          <p>{index + 1}</p>
        </GridItem>
      );
    })}
  </GridLayout>
);
