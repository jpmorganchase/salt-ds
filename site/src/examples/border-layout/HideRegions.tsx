import { BorderItem, BorderLayout } from "@salt-ds/core";
import clsx from "clsx";
import type { ReactElement } from "react";
import hideRegionsStyles from "./HideRegions.module.css";
import styles from "./index.module.css";

export const HideRegions = (): ReactElement => (
  <BorderLayout className={hideRegionsStyles.borderLayout}>
    <BorderItem position="north" className={styles.borderItem}>
      North
    </BorderItem>
    <BorderItem position="west" className={styles.borderItem}>
      West
    </BorderItem>
    <BorderItem position="center" className={styles.borderItem}>
      Center
    </BorderItem>
  </BorderLayout>
);
