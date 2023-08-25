import { ReactElement } from "react";
import clsx from "clsx";
import { BorderLayout, BorderItem } from "@salt-ds/core";
import styles from "./index.module.css";
import hideRegionsStyles from "./HideRegions.module.css";

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
