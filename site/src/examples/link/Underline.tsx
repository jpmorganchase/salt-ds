import { Link, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Underline = (): ReactElement => (
  <StackLayout align="start">
    <Link href="#" className={styles.linkExample}>
      Underline default
    </Link>
    <Link href="#" underline="never" className={styles.linkExample}>
      Underline never
    </Link>
  </StackLayout>
);
