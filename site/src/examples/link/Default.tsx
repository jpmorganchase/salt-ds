import { Link } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Default = (): ReactElement => (
  <Link href="/salt/components" className={styles.linkExample}>
    Browse component documentation
  </Link>
);
