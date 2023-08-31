import { ReactElement } from "react";
import { GridLayout, GridItem } from "@salt-ds/core";
import clsx from "clsx";
import styles from "./index.module.css";
import defaultStyles from "./Default.module.css";

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
