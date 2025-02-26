import { Link, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Underline = (): ReactElement => (
  <StackLayout align="start">
    <Link href="#" underline="link" className={styles.linkExample}>
      Underline link
    </Link>
    <Link href="#" underline="hover" className={styles.linkExample}>
      Underline hover
    </Link>
  </StackLayout>
);
