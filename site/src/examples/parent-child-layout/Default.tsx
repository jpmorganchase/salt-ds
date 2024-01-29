import { ReactElement } from "react";
import { ParentChildLayout } from "@salt-ds/lab";

import styles from "./Default.module.css";

const parent = (
  <div className={styles.parentContent} style={{ height: 500, minWidth: 150 }}>
    Parent
  </div>
);

const child = (
  <div className={styles.childContent} style={{ height: 500 }}>
    Child
  </div>
);

export const Default = (): ReactElement => (
  <ParentChildLayout
    parent={parent}
    child={child}
    style={{ width: "60vw", maxWidth: 600, height: 500 }}
  />
);
