import { ReactElement } from "react";
import clsx from "clsx";
import { BorderLayout, BorderItem } from "@salt-ds/core";
import styles from "./index.module.css";

export const GapBetweenRegions = (): ReactElement => (
  <BorderLayout className={styles.borderLayout} gap={3}>
    <BorderItem position="north" className={styles.borderItem}>
      North
    </BorderItem>
    <BorderItem position="west" className={styles.borderItem}>
      West
    </BorderItem>
    <BorderItem position="center" className={styles.borderItem}>
      Center
    </BorderItem>
    <BorderItem position="east" className={styles.borderItem}>
      East
    </BorderItem>
    <BorderItem position="south" className={styles.borderItem}>
      South
    </BorderItem>
  </BorderLayout>
);
