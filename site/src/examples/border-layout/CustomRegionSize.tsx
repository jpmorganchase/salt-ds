import { BorderItem, BorderLayout } from "@salt-ds/core";
import clsx from "clsx";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const CustomRegionSize = (): ReactElement => (
  <BorderLayout style={{ width: "90%" }}>
    <BorderItem position="north" className={styles.borderItem}>
      North
    </BorderItem>
    <BorderItem
      position="west"
      className={styles.borderItem}
      style={{ width: 100 }}
    >
      West
    </BorderItem>
    <BorderItem position="center" className={styles.borderItem}>
      Center
    </BorderItem>
    <BorderItem
      position="east"
      className={styles.borderItem}
      style={{ width: 100 }}
    >
      East
    </BorderItem>
    <BorderItem position="south" className={styles.borderItem}>
      South
    </BorderItem>
  </BorderLayout>
);
