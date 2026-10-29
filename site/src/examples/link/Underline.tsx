import { Link, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Underline = (): ReactElement => (
  <StackLayout align="start">
    <Link href="/salt/components/breadcrumbs" className={styles.linkExample}>
      View breadcrumbs documentation
    </Link>
    <Link
      href="/salt/components/navigation-item"
      underline="never"
      className={styles.linkExample}
    >
      View navigation guidance
    </Link>
  </StackLayout>
);
