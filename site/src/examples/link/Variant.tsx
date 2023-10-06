import { ReactElement } from "react";
import { Link, StackLayout } from "@salt-ds/core";
import styles from "./index.module.css";

export const Variant = (): ReactElement => (
  <StackLayout>
    <Link href="#" variant="primary" className={styles.linkExample}>
      Primary Link variant
    </Link>
    <Link href="#" variant="secondary" className={styles.linkExample}>
      Secondary Link variant
    </Link>
  </StackLayout>
);
