import { GridItem, GridLayout } from "@salt-ds/core";
import { clsx } from "clsx";
import type { ReactElement } from "react";
import defaultStyles from "./Default.module.css";
import styles from "./index.module.css";

export const Default = (): ReactElement => (
  <GridLayout>
    {Array.from({ length: 12 }, (_, index) => (
      <GridItem
        key={index}
        className={clsx(styles.gridItem, defaultStyles.gridItem)}
      >
        <p>{index + 1}</p>
      </GridItem>
    ))}
  </GridLayout>
);
