import { Link, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Variant = (): ReactElement => (
  <StackLayout align="start">
    <Link
      href="/salt/components/button"
      variant="primary"
      className={styles.linkExample}
    >
      View button documentation
    </Link>
    <Link
      href="/salt/components/badge"
      variant="secondary"
      className={styles.linkExample}
    >
      View badge documentation
    </Link>
  </StackLayout>
);
